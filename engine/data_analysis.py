import pandas as pd
import numpy as np

def get_profile(df: pd.DataFrame) -> dict:
    """
    Generates a comprehensive profile of the dataset.
    """
    profile = {
        "rows": len(df),
        "cols": len(df.columns),
        "missing_cells": int(df.isnull().sum().sum()),
        "missing_cells_pct": float(df.isnull().sum().sum() / df.size * 100),
        "columns": {}
    }
    
    for col in df.columns:
        col_data = df[col]
        dtype = str(col_data.dtype)
        n_unique = int(col_data.nunique())
        n_missing = int(col_data.isnull().sum())
        
        col_profile = {
            "dtype": dtype,
            "unique": n_unique,
            "missing": n_missing,
            "missing_pct": float(n_missing / len(df) * 100),
        }
        
        if np.issubdtype(col_data.dtype, np.number):
            col_profile.update({
                "mean": float(col_data.mean()),
                "std": float(col_data.std()),
                "min": float(col_data.min()),
                "max": float(col_data.max()),
            })
            
        profile["columns"][col] = col_profile
        
    return profile

def infer_problem_type(df: pd.DataFrame, target_col: str = None) -> str:
    """
    Infers if the problem is Classification or Regression based on the target column.
    If no target is specified, returns 'Unknown'.
    """
    if not target_col or target_col not in df.columns:
        return "Unsupervised / Unknown"
        
    target = df[target_col]
    
    if pd.api.types.is_numeric_dtype(target):
        # High cardinality usually means regression, low might be classification
        if target.nunique() < 20: 
            return "Classification"
        return "Regression"
        
    return "Classification"
