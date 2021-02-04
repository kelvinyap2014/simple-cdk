from sqs_listener import SqsListener
import boto3
import uuid

class MyListener(SqsListener):
    def handle_message(self, body, attributes, messages_attributes):
        print(body)
        put_to_s3(body["Message"])

def put_to_s3(message):
    print("Message is: " + message)

    # Retrieve the list of existing buckets
    s3_client = boto3.client("s3")
    response = s3_client.list_buckets()

    # Output the bucket names
    bucket_name = ""
    print("Existing buckets:")
    for bucket in response["Buckets"]:
        print(f'  {bucket["Name"]}')
        if(bucket["Name"].startswith("simplecdkstack-simplebucket")):
            bucket_name = bucket["Name"]
    print(f"found - {bucket_name}")

    # Create file
    file_name = create_temp_file('-SQS-message.txt', message)

    # Talk to S3
    s3_resource = boto3.resource('s3')
    s3_resource.Bucket(bucket_name).upload_file(Filename=file_name, Key=file_name)
    print(f"Uploaded file to S3 - {file_name}")

def create_temp_file(file_name, file_content):
    random_file_name = ''.join([str(uuid.uuid4().hex[:6]), file_name])
    with open(random_file_name, 'w') as f:
        f.write(str(file_content))
    return random_file_name

listener = MyListener('SimpleQueue', error_queue='ErrorQueue', region_name='us-east-2')
print("Simple Python Service listening on AWS SQS")
listener.listen()
