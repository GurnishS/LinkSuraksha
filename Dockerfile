# FROM ubuntu:24.04

# ENV DEBIAN_FRONTEND=noninteractive

# # Install dependencies
# RUN apt-get update && apt-get install -y \
#     wget \
#     gnupg \
#     ca-certificates \
#     lsb-release \
#     apt-transport-https \
#     software-properties-common \
#     curl

# # Add MongoDB 7 GPG key
# RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.gpg

# # Add MongoDB repo (jammy for compatibility with 24.04)
# RUN echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-7.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
#     > /etc/apt/sources.list.d/mongodb-org-7.0.list

# # Install MongoDB
# RUN apt-get update && apt-get install -y mongodb-org

# # Create db folder
# RUN mkdir -p /data/db
# VOLUME /data/db

# # Copy seed data
# COPY seed/ /seed/

# # Expose MongoDB port
# EXPOSE 27017

# # Start MongoDB as replica set, init rs, and import data
# CMD mongod --bind_ip 0.0.0.0 --replSet rs0 --fork --logpath /var/log/mongodb.log && \
#     sleep 3 && \
#     mongosh --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})" && \
#     sleep 3 && \
#     for db in /seed/*; do \
#       dbname=$(basename "$db"); \
#       for file in "$db"/*.json; do \
#         collname=$(basename "$file" .json); \
#         mongoimport --db "$dbname" --collection "$collname" --file "$file" --jsonArray; \
#       done; \
#     done && \
#     tail -f /var/log/mongodb.log

# # Run commands
# # docker build -t mongo-seeded .
# # docker run -p 27017:27017 mongo-seeded

# Use the official MongoDB image (based on Debian slim)
FROM mongo:7.0

# Create db volume
VOLUME /data/db

# Copy seed data into image
COPY seed/ /seed/

# Expose default MongoDB port
EXPOSE 27017

# Start MongoDB, init replica set, and seed data
CMD mongod --bind_ip_all --replSet rs0 --fork --logpath /var/log/mongodb.log && \
    sleep 3 && \
    mongosh --eval "rs.initiate({_id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }]})" && \
    sleep 3 && \
    for db in /seed/*; do \
      dbname=$(basename "$db"); \
      for file in "$db"/*.json; do \
        collname=$(basename "$file" .json); \
        mongoimport --db "$dbname" --collection "$collname" --file "$file" --jsonArray; \
      done; \
    done && \
    tail -f /var/log/mongodb.log
