from collections import defaultdict
from fastapi.exceptions import RequestValidationError


def serialize_errors(exception: RequestValidationError):
    errors = defaultdict(list)
    for pydantic_error in exception.errors():
        location = pydantic_error['loc']
        message = pydantic_error['msg']
        cleaned_location = location[1:] if location[0] in ('body', 'query', 'path') else location
        field_string = '.'.join(cleaned_location)
        cleaned_message = message
        # dropping pydantic bullshit, leaving just real message
        if message.startswith('Value error, '):
            cleaned_message = message[13:]
        errors[field_string].append(cleaned_message)
    return errors
