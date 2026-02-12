import sys
from io import StringIO
import pandas as pd
import contextlib

def execute_code(code: str):
    """
    Executes Python code safely and captures stdout/stderr.
    """
    # Create a buffer to capture output
    buffer = StringIO()
    
    # Context for execution
    # We can pre-load pandas as pd, etc.
    local_scope = {"pd": pd}
    
    try:
        from pyspark.sql import SparkSession
        spark = SparkSession.builder.appName("ChanceTEK").getOrCreate()
        local_scope["spark"] = spark
    except ImportError:
        pass
        
    try:
        with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
            exec(code, {}, local_scope)
        
        result = buffer.getvalue()
        return {"result": result, "error": None}
        
    except Exception as e:
        return {"result": buffer.getvalue(), "error": str(e)}
