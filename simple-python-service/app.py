import localstack_client.session
import botocore
import boto3
import time
import json
from decouple import config
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        # logging.FileHandler("debug.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

def ensure_aws(service):
    if 'true' == config('PY_DEV'):
        session = localstack_client.session.Session(localstack_host=config('PY_LOCALSTACK_HOST_NAME'))
        return session.client(service)
    else:
        return boto3.client(service)

def find_queue_url(sqs, queueName):
    queue_url = None
    try:
        response = sqs.list_queues(QueueNamePrefix=queueName)
        logging.info('Success SQS list_queues()')
        if 'QueueUrls' in response and response['QueueUrls']:
            queue_url = response['QueueUrls'][0]
            logging.info(f'Found queue - {queue_url}')
    except Exception:
        logging.error('Error SQS list_queues()', exc_info=True)

    return queue_url

def ensure_queue(sqs, queueName):
    queue_url = find_queue_url(sqs, queueName)
    if queue_url:
        return queue_url

    logging.info('Queue [' + queueName + '] not exists. Create one.')
    sqs.create_queue(QueueName=queueName)
    time.sleep(5)
    queue = sqs.get_queue_url(QueueName=queueName)
    queue_url = queue['QueueUrl']
    logging.info(f'Created queue - {queue_url}')
            
    return queue_url

def process_queue(sqs, queueUrl):
    message = sqs.receive_message(QueueUrl=queueUrl)
    if 'Messages' in message.keys():
        for m in message['Messages']:
            logging.info('Found message --> ' + m['Body'])
            body = json.loads(m['Body'])
            put_to_s3(body['Message'], body['File'])
            sqs.delete_message(QueueUrl=queueUrl, ReceiptHandle=m['ReceiptHandle'])
        process_queue(sqs, queueUrl)
    else:
        logging.info(queueUrl + ' has no more message')

def ensure_bucket(s3):
    # Retrieve the list of existing buckets
    response = s3.list_buckets()

    # Output the bucket names
    bucket_name = ''
    logging.info('Checking existing buckets:')
    for bucket in response['Buckets']:
        logging.info(f'  {bucket["Name"]}')
        if(bucket['Name'].startswith(config('PY_BUCKET_NAME'))):
            bucket_name = bucket['Name']
    if bucket_name != '':
        logging.info(f'Found bucket - {bucket_name}')
    else:
        logging.info('Bucket [' + config('PY_BUCKET_NAME') + '] not exists. Create one.')
        bucket_name = config('PY_BUCKET_NAME')
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={'LocationConstraint': config('PY_REGION')})

    return bucket_name

def put_to_s3(message, file_name):
    logging.info('Message is: ' + message)
    
    s3 = ensure_aws('s3')
    bucket_name = ensure_bucket(s3)

    # Create file
    with open(file_name, 'w') as f:
        f.write(str(message))

    # Talk to S3
    s3.upload_file(file_name, bucket_name, file_name)
    logging.info(f'Uploaded file to S3 - {file_name}')


logging.info('Simple Python Service sleeping...')
time.sleep(int(config('PY_DELAY')))
logging.info('Simple Python Service starting...')
sqs = ensure_aws('sqs')
queue_url = ensure_queue(sqs, config('PY_QUEUE_NAME'))
logging.info('Simple Python Service listening on AWS SQS')
while(True):
	process_queue(sqs, queue_url)
	time.sleep(int(config('PY_INTERVAL')))
