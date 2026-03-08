
import os
import sys
import json
import time
import pickle
import argparse
import pathlib
import warnings
from datetime import datetime

warnings.filterwarnings("ignore")

# ── Rich terminal output ──────────────────────────────────────────────────────
try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
    from rich.text import Text
    from rich import box
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

console = Console() if HAS_RICH else None

def log(msg, style=""):
    if HAS_RICH:
        console.print(msg, style=style)
    else:
        print(msg)

def banner():
    if HAS_RICH:
        console.print(Panel.fit(
            "[bold cyan]FinScope-Ai[/bold cyan]  [dim]ML Pipeline CLI[/dim]\n"
            "[dim]Anomaly Detection · Spending Prediction · Clustering[/dim]",
            border_style="cyan"
        ))
    else:
        print("\n=== FinScope-Ai ML Pipeline ===\n")

# ── Lazy imports (only load when running) ────────────────────────────────────
def load_deps():
    global np, pd, torch, nn, optim, StandardScaler, IsolationForest
    global KMeans, PCA, train_test_split, mean_absolute_error, r2_score
    global create_client, anthropic, load_dotenv

    import numpy as np
    import pandas as pd
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import IsolationForest
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
    from supabase import create_client
    import anthropic
    from dotenv import load_dotenv
    return True


# ── Neural Network Definitions ───────────────────────────────────────────────
def build_autoencoder(input_dim, latent_dim=8):
    import torch.nn as nn
    class AE(nn.Module):
        def __init__(self):
            super().__init__()
            self.encoder = nn.Sequential(
                nn.Linear(input_dim, 64), nn.LayerNorm(64), nn.LeakyReLU(0.1), nn.Dropout(0.2),
                nn.Linear(64, 32),        nn.LayerNorm(32), nn.LeakyReLU(0.1),
                nn.Linear(32, latent_dim),
            )
            self.decoder = nn.Sequential(
                nn.Linear(latent_dim, 32), nn.LayerNorm(32), nn.LeakyReLU(0.1),
                nn.Linear(32, 64),         nn.LayerNorm(64), nn.LeakyReLU(0.1),
                nn.Linear(64, input_dim),
            )
        def forward(self, x):
            z = self.encoder(x)
            return self.decoder(z), z
        def recon_error(self, x):
            xh, _ = self.forward(x)
            return ((x - xh) ** 2).mean(dim=1)
    return AE()


def build_predictor(input_dim):
    import torch.nn as nn
    class MLP(nn.Module):
        def __init__(self):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(input_dim, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.3),
                nn.Linear(128, 64),        nn.BatchNorm1d(64),  nn.ReLU(), nn.Dropout(0.2),
                nn.Linear(64, 32),         nn.ReLU(),
                nn.Linear(32, 1),
            )
        def forward(self, x):
            return self.net(x).squeeze(-1)
    return MLP()


# ── Pipeline Steps ────────────────────────────────────────────────────────────
def step_load(supabase, table, limit):
    log(f"\n[bold][ 1/6 ][/bold] Loading data from [cyan]{table}[/cyan]", "")
    response = supabase.table(table).select("*").limit(limit).execute()
    df = __import__("pandas").DataFrame(response.data)
    log(f"       [green]✓[/green] {len(df):,} rows fetched")
    return df


def step_features(df):
    log("\n[bold][ 2/6 ][/bold] Engineering features")
    import numpy as np
    import pandas as pd
    from sklearn.preprocessing import LabelEncoder

    df = df.copy()
    if "created_at" in df.columns:
        df["created_at"]    = pd.to_datetime(df["created_at"])
        df["hour"]          = df["created_at"].dt.hour
        df["day_of_week"]   = df["created_at"].dt.dayofweek
        df["day_of_month"]  = df["created_at"].dt.day
        df["month"]         = df["created_at"].dt.month
        df["is_weekend"]    = (df["day_of_week"] >= 5).astype(int)

    if "amount" in df.columns:
        df["amount"]        = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
        df["amount_log"]    = np.log1p(df["amount"].abs())
        df["amount_zscore"] = (df["amount"] - df["amount"].mean()) / (df["amount"].std() + 1e-8)

    if "category" in df.columns:
        le = LabelEncoder()
        df["category_enc"] = le.fit_transform(df["category"].astype(str))

    if "user_id" in df.columns and "amount" in df.columns:
        sort_cols = ["user_id", "created_at"] if "created_at" in df.columns else ["user_id"]
        df = df.sort_values(sort_cols)
        df["user_avg_7d"]   = df.groupby("user_id")["amount"].transform(lambda x: x.rolling(7, min_periods=1).mean())
        df["user_std_7d"]   = df.groupby("user_id")["amount"].transform(lambda x: x.rolling(7, min_periods=1).std().fillna(0))
        df["user_tx_count"] = df.groupby("user_id").cumcount() + 1

    feature_cols = [c for c in [
        "amount","amount_log","amount_zscore",
        "hour","day_of_week","day_of_month","month","is_weekend",
        "category_enc","user_avg_7d","user_std_7d","user_tx_count"
    ] if c in df.columns]

    log(f"       [green]✓[/green] {len(feature_cols)} features built: {feature_cols}")
    return df, feature_cols


def step_anomaly(df, feature_cols, device):
    log("\n[bold][ 3/6 ][/bold] Anomaly detection")
    import numpy as np
    import torch
    from torch.utils.data import DataLoader, TensorDataset

    X = df[feature_cols].fillna(0).values
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    # IsolationForest baseline
    iso = IsolationForest(n_estimators=200, contamination=0.05, random_state=42)
    df["is_anomaly"] = (iso.fit_predict(Xs) == -1).astype(int)
    log(f"       IsolationForest  → [yellow]{df['is_anomaly'].sum()}[/yellow] anomalies")

    # Autoencoder
    X_normal = Xs[df["is_anomaly"] == 0]
    ds = TensorDataset(torch.tensor(X_normal, dtype=torch.float32))
    ld = DataLoader(ds, batch_size=64, shuffle=True)

    ae = build_autoencoder(Xs.shape[1]).to(device)
    opt = torch.optim.AdamW(ae.parameters(), lr=1e-3, weight_decay=1e-5)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=60)
    crit = torch.nn.MSELoss()

    ae.train()
    for epoch in range(60):
        for (batch,) in ld:
            batch = batch.to(device)
            opt.zero_grad()
            xh, _ = ae(batch)
            loss = crit(xh, batch)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(ae.parameters(), 1.0)
            opt.step()
        sched.step()

    ae.eval()
    with torch.no_grad():
        Xt = torch.tensor(Xs, dtype=torch.float32).to(device)
        err = ae.recon_error(Xt).cpu().numpy()

    threshold = np.percentile(err[df["is_anomaly"] == 0], 95)
    df["recon_error"] = err
    df["nn_anomaly"]  = (err > threshold).astype(int)
    log(f"       Autoencoder      → [yellow]{df['nn_anomaly'].sum()}[/yellow] anomalies  (threshold={threshold:.5f})")

    return df, scaler, iso, ae, Xs


def step_predict(df, feature_cols, device, epochs):
    log("\n[bold][ 4/6 ][/bold] Training spending predictor")
    import numpy as np
    import torch
    from torch.utils.data import DataLoader, TensorDataset
    from sklearn.metrics import mean_absolute_error, r2_score

    reg_cols = [c for c in feature_cols if c not in ["amount","amount_log","amount_zscore"]]
    if not reg_cols:
        reg_cols = feature_cols[:-3] or feature_cols

    X = df[reg_cols].fillna(0).values
    y = df["amount_log"].fillna(0).values if "amount_log" in df.columns else df[feature_cols[0]].values

    scaler_reg = StandardScaler()
    Xs = scaler_reg.fit_transform(X)
    X_tr, X_te, y_tr, y_te = train_test_split(Xs, y, test_size=0.2, random_state=42)

    tr_ld = DataLoader(TensorDataset(
        torch.tensor(X_tr, dtype=torch.float32),
        torch.tensor(y_tr, dtype=torch.float32)
    ), batch_size=128, shuffle=True)

    model = build_predictor(Xs.shape[1]).to(device)
    opt   = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.ReduceLROnPlateau(opt, patience=5, factor=0.5)
    crit  = torch.nn.HuberLoss(delta=1.0)

    model.train()
    for epoch in range(epochs):
        ep_loss = 0.0
        for xb, yb in tr_ld:
            xb, yb = xb.to(device), yb.to(device)
            opt.zero_grad()
            loss = crit(model(xb), yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            ep_loss += loss.item()
        sched.step(ep_loss / len(tr_ld))

    model.eval()
    with torch.no_grad():
        y_pred = model(torch.tensor(X_te, dtype=torch.float32).to(device)).cpu().numpy()

    mae = mean_absolute_error(y_te, y_pred)
    r2  = r2_score(y_te, y_pred)
    log(f"       [green]✓[/green] MAE={mae:.4f}  R²={r2:.4f}")
    return model, scaler_reg, mae, r2


def step_cluster(df, Xs, k=4):
    log("\n[bold][ 5/6 ][/bold] Clustering transactions")
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    df["cluster"] = km.fit_predict(Xs)
    if "amount" in df.columns:
        for c in range(k):
            grp = df[df["cluster"] == c]["amount"]
            log(f"       Cluster {c}  n={len(grp):,}  mean=£{grp.mean():.2f}  median=£{grp.median():.2f}")
    return df, km


def step_claude(df, mae, r2, k, claude_client):
    log("\n[bold][ 6/6 ][/bold] Generating Claude insights")
    summary = {
        "total_transactions": len(df),
        "anomalies": {
            "isolation_forest": int(df["is_anomaly"].sum()),
            "autoencoder":      int(df["nn_anomaly"].sum()),
        },
        "spending_predictor": {"mae": round(float(mae), 4), "r2": round(float(r2), 4)},
        "clusters": {},
    }
    if "amount" in df.columns:
        for c in range(k):
            grp = df[df["cluster"] == c]["amount"]
            summary["clusters"][f"cluster_{c}"] = {
                "count": len(grp),
                "mean":  round(float(grp.mean()), 2),
                "median":round(float(grp.median()), 2),
            }

    prompt = f"""You are a financial AI analyst for FinScope-Ai.

Results from neural network pipeline:
{json.dumps(summary, indent=2)}

Write a concise financial intelligence report:
1. Anomaly findings and what to investigate
2. Spending prediction quality in plain English
3. Name and characterise each cluster
4. 3 actionable recommendations

Be specific and professional. Short paragraphs, no bullet lists."""

    response = claude_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    narrative = response.content[0].text
    return summary, narrative


def step_save(models_dir, ae, predictor, scaler, scaler_reg, iso, km):
    log(f"\n       Saving models to [cyan]{models_dir}[/cyan]")
    import torch, pickle
    p = pathlib.Path(models_dir)
    p.mkdir(parents=True, exist_ok=True)
    torch.save(ae.state_dict(),        p / "autoencoder.pt")
    torch.save(predictor.state_dict(), p / "spending_predictor.pt")
    for name, obj in [("scaler", scaler), ("scaler_reg", scaler_reg), ("iso_forest", iso), ("kmeans", km)]:
        with open(p / f"{name}.pkl", "wb") as f:
            pickle.dump(obj, f)
    log(f"       [green]✓[/green] All models saved")


# ── CLI Entry Point ───────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        prog="finscope",
        description="FinScope-Ai ML Pipeline CLI"
    )
    sub = parser.add_subparsers(dest="command")

    run_p = sub.add_parser("run", help="Run the full ML pipeline")
    run_p.add_argument("--table",     default="user_transactions", help="Supabase table name")
    run_p.add_argument("--limit",     type=int, default=5000,      help="Max rows to fetch")
    run_p.add_argument("--epochs",    type=int, default=80,        help="Training epochs")
    run_p.add_argument("--clusters",  type=int, default=4,         help="Number of KMeans clusters")
    run_p.add_argument("--no-claude", action="store_true",         help="Skip Claude insights")
    run_p.add_argument("--models-dir",default="/Users/mohamedmunir/Desktop/FinScope-Ai/ai-service/models")
    run_p.add_argument("--env",       default="/Users/mohamedmunir/Desktop/FinScope-Ai/ai-service/notebooks/.env")

    args = parser.parse_args()

    if args.command != "run":
        parser.print_help()
        sys.exit(0)

    banner()
    t0 = time.time()

    # ── Load deps & env ───────────────────────────────────────────────────────
    log("[dim]Loading dependencies...[/dim]")
    load_deps()
    load_dotenv(dotenv_path=args.env, override=True)

    supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    claude_client   = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    device          = __import__("torch").device("cuda" if __import__("torch").cuda.is_available() else "cpu")
    log(f"Device: [cyan]{device}[/cyan]")

    # ── Run pipeline ──────────────────────────────────────────────────────────
    df                          = step_load(supabase_client, args.table, args.limit)
    df, feature_cols            = step_features(df)
    df, scaler, iso, ae, Xs     = step_anomaly(df, feature_cols, device)
    predictor, scaler_reg, mae, r2 = step_predict(df, feature_cols, device, args.epochs)
    df, km                      = step_cluster(df, Xs, args.clusters)

    summary, narrative = {}, ""
    if not args.no_claude:
        summary, narrative = step_claude(df, mae, r2, args.clusters, claude_client)

    step_save(args.models_dir, ae, predictor, scaler, scaler_reg, iso, km)

    # ── Summary table ─────────────────────────────────────────────────────────
    elapsed = time.time() - t0
    if HAS_RICH:
        table = Table(box=box.SIMPLE_HEAVY, border_style="cyan", show_header=True, header_style="bold cyan")
        table.add_column("Metric", style="dim")
        table.add_column("Value",  style="bold white")
        table.add_row("Transactions",      f"{len(df):,}")
        table.add_row("ISO anomalies",     str(df['is_anomaly'].sum()))
        table.add_row("AE anomalies",      str(df['nn_anomaly'].sum()))
        table.add_row("Predictor R²",      f"{r2:.4f}")
        table.add_row("Predictor MAE",     f"{mae:.4f}")
        table.add_row("Clusters",          str(args.clusters))
        table.add_row("Time elapsed",      f"{elapsed:.1f}s")
        console.print("\n"); console.print(table)
    else:
        print(f"\nDone in {elapsed:.1f}s  |  R²={r2:.4f}  |  MAE={mae:.4f}")

    if narrative:
        if HAS_RICH:
            console.print(Panel(narrative, title="[bold cyan]Claude Insights[/bold cyan]", border_style="cyan"))
        else:
            print("\n--- Claude Insights ---\n", narrative)

    log("\n[bold green]Pipeline complete.[/bold green]")


if __name__ == "__main__":
    main()