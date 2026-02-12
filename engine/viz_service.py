import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO
import pandas as pd
import numpy as np

# Set Elite style
sns.set_theme(style="darkgrid", rc={"axes.facecolor": "#1c2336", "figure.facecolor": "#0a0e17", "grid.color": "#374151", "text.color": "#ffffff", "axes.labelcolor": "#a0aec0", "xtick.color": "#a0aec0", "ytick.color": "#a0aec0"})


def get_distribution_data(data: pd.DataFrame, column: str):
    # Create histogram bins
    if not pd.api.types.is_numeric_dtype(data[column]):
        # Categorical
        counts = data[column].value_counts().reset_index()
        counts.columns = ['name', 'value']
        return counts.to_dict(orient='records')
    
    # Numeric - Create bins
    hist, bin_edges = np.histogram(data[column].dropna(), bins=20)
    result = []
    for i in range(len(hist)):
        result.append({
            "name": f"{bin_edges[i]:.2f}-{bin_edges[i+1]:.2f}",
            "value": int(hist[i])
        })
    return result

def get_correlation_data(data: pd.DataFrame):
    numeric_df = data.select_dtypes(include=['float64', 'int64'])
    if numeric_df.empty:
        return []
    
    corr = numeric_df.corr().reset_index()
    return corr.to_dict(orient='records')

def get_scatter_data(data: pd.DataFrame, x: str, y: str):
    if x not in data.columns or y not in data.columns:
        return []
    
    sample = data[[x, y]].dropna().sample(min(1000, len(data)))
    return sample.rename(columns={x: "x", y: "y"}).to_dict(orient='records')

