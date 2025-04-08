#!/bin/bash

# Install dependencies if needed
sudo apt-get update
sudo apt-get install -y nginx

# Remove existing files if any
if [ -d /var/www/html ]; then
    sudo rm -rf /var/www/html/*
fi