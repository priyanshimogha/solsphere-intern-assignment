#!/usr/bin/env python3
"""
System Health Monitor - Main Module

This module serves as the entry point for the System Health Monitor utility.
It initializes the background daemon and handles the system health checks.

Author: [Your Name]
Date: May 2025
"""

import argparse
import logging
import sys
import time
from datetime import datetime

from system_checks import SystemChecker
from daemon import Daemon
from api_client import APIClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("system_monitor.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("SystemMonitor")

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='System Health Monitor')
    parser.add_argument('--interval', type=int, default=30,
                        help='Check interval in minutes (default: 30)')
    parser.add_argument('--api-url', type=str, default='http://localhost:3000/api',
                        help='API endpoint URL')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug mode')
    return parser.parse_args()

def main():
    """Main entry point for the application."""
    args = parse_arguments()
    
    # Set logging level based on debug flag
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Debug mode enabled")
    
    # Initialize components
    system_checker = SystemChecker()
    api_client = APIClient(args.api_url)
    
    # Initial system check
    logger.info("Performing initial system check...")
    system_data = system_checker.check_all()
    logger.info(f"Initial check results: {system_data}")
    
    # Send initial data to API
    try:
        api_client.send_data(system_data)
        logger.info("Initial data sent to API successfully")
    except Exception as e:
        logger.error(f"Failed to send initial data to API: {e}")
    
    # Initialize and start the daemon
    daemon = Daemon(
        interval_minutes=args.interval,
        system_checker=system_checker,
        api_client=api_client
    )
    
    logger.info(f"Starting daemon with check interval of {args.interval} minutes")
    daemon.start()
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
        daemon.stop()
        logger.info("Daemon stopped, exiting")

if __name__ == "__main__":
    main()
