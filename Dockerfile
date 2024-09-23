# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set the working directory in the container
WORKDIR $HOME/app

# Copy the current directory contents into the container at $HOME/app
COPY --chown=user . $HOME/app

# Install any necessary dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Ensure the 'saved_data' and other writable directories are owned by the "user"
RUN mkdir -p saved_data && chown -R user:user .

# Expose port 7860 for the FastAPI app
EXPOSE 7860

# Define the command to run the FastAPI app with Uvicorn 
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
