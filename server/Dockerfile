# Optimized Dockerfile for Void Runner

FROM ubuntu:20.04

# Set non-interactive mode for apt-get
ARG DEBIAN_FRONTEND=noninteractive

# Update and install dependencies using apt-get
RUN apt-get update && \  
    apt-get install -y \
      curl \
      git \
      build-essential \
      && rm -rf /var/lib/apt/lists/* \
    && apt-get clean;

# Add error handling
RUN set -e; \
    echo 'Error handling added!';

# Set the work directory
WORKDIR /app

# Copy source files
COPY . .

# Ensure proper build sequence by running build command
RUN make build || { echo 'Build failed'; exit 1; }

# CMD to run the application
CMD ["./your-application-binary"]