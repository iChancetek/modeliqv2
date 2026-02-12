import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer

def apply_transforms(df: pd.DataFrame, steps: list) -> pd.DataFrame:
    """
    Applies a sequence of transformation steps to the dataframe.
    steps: list of dicts { "type": "cleaning", "action": "impute", "params": {...} }
    """
    df_transformed = df.copy()

    for step in steps:
        step_type = step.get("type")
        action = step.get("action")
        params = step.get("params", {})

        if step_type == "cleaning":
            if action == "drop_duplicates":
                df_transformed.drop_duplicates(inplace=True)
            
            elif action == "drop_column":
                col = params.get("column")
                if col in df_transformed.columns:
                    df_transformed.drop(columns=[col], inplace=True)
            
            elif action == "impute":
                col = params.get("column")
                strategy = params.get("strategy", "mean") # mean, median, most_frequent, constant
                fill_value = params.get("fill_value", None)
                
                if col in df_transformed.columns:
                    if strategy == "constant" and fill_value is not None:
                         df_transformed[col].fillna(fill_value, inplace=True)
                    else:
                        # Simple imputer logic using pandas for simplicity where possible
                        if strategy == "mean":
                            val = df_transformed[col].mean()
                        elif strategy == "median":
                             val = df_transformed[col].median()
                        elif strategy == "most_frequent":
                            val = df_transformed[col].mode()[0]
                        else:
                            val = None
                        
                        if val is not None:
                            df_transformed[col].fillna(val, inplace=True)

        elif step_type == "preprocessing":
            if action == "scale":
                cols = params.get("columns", [])
                method = params.get("method", "standard") # standard, minmax
                
                # Filter valid numeric cols
                valid_cols = [c for c in cols if c in df_transformed.columns and pd.api.types.is_numeric_dtype(df_transformed[c])]
                
                if valid_cols:
                    scaler = StandardScaler() if method == "standard" else MinMaxScaler()
                    df_transformed[valid_cols] = scaler.fit_transform(df_transformed[valid_cols])
            
            elif action == "encode":
                cols = params.get("columns", [])
                method = params.get("method", "label") # label, onehot
                
                valid_cols = [c for c in cols if c in df_transformed.columns]

                if method == "label":
                    le = LabelEncoder()
                    for col in valid_cols:
                        # Convert to string to ensure consistent encoding
                        df_transformed[col] = le.fit_transform(df_transformed[col].astype(str))
                elif method == "onehot":
                    df_transformed = pd.get_dummies(df_transformed, columns=valid_cols, drop_first=True)

    return df_transformed
