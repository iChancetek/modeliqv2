import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score

def recommend_algorithms(problem_type: str):
    """
    Returns a list of recommended algorithms based on the problem type.
    """
    if problem_type == "Classification":
        return [
            {"name": "Random Forest Classifier", "id": "rf_clf", "desc": "Robust ensemble method, good for complex data."},
            {"name": "Logistic Regression", "id": "log_reg", "desc": "Simple, interpretable baseline."},
        ]
    elif problem_type == "Regression":
        return [
            {"name": "Random Forest Regressor", "id": "rf_reg", "desc": "Non-linear regression, handles outliers well."},
            {"name": "Linear Regression", "id": "lin_reg", "desc": "Basic linear approach."},
        ]
    return []

def train_model(df: pd.DataFrame, target_col: str, algorithm_id: str, problem_type: str):
    """
    Trains a model using a standard pipeline (Impute -> Scale -> Train).
    """
    # Split
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Preprocessing
    numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
    categorical_cols = X.select_dtypes(include=['object', 'bool']).columns
    
    numerical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='mean')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore')) # Need to import OneHotEncoder
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
    
    # Model Selection
    if algorithm_id == "rf_clf":
        model = RandomForestClassifier()
    elif algorithm_id == "log_reg":
        model = LogisticRegression()
    elif algorithm_id == "rf_reg":
        model = RandomForestRegressor()
    elif algorithm_id == "lin_reg":
        model = LinearRegression()
    else:
        raise ValueError("Unknown algorithm ID")
        
    # Full Pipeline
    pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                               ('model', model)])
                               
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    
    metrics = {}
    if problem_type == "Classification":
        metrics["accuracy"] = accuracy_score(y_test, y_pred)
        # Handle multiclass metrics? defaulting to macro for now if needed, but accuracy is safe start
        metrics["f1"] = f1_score(y_test, y_pred, average='macro') 
    else:
        metrics["mae"] = mean_absolute_error(y_test, y_pred)
        metrics["r2"] = r2_score(y_test, y_pred)
        
    return metrics, pipeline
