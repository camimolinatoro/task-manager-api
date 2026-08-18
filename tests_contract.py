import json
import random
import string
import requests
from jsonschema import validate, ValidationError

BASE_URL = "http://localhost:3000"


def load_schema(name):
    with open(f"contracts/{name}", "r", encoding="utf-8") as f:
        return json.load(f)


def random_email():
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"contract_{suffix}@test.com"


def test_login_response_matches_contract():
    email = random_email()
    password = "contract123"

    requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": password})
    response = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})

    assert response.status_code == 200
    schema = load_schema("auth-token.schema.json")

    try:
        validate(instance=response.json(), schema=schema)
    except ValidationError as e:
        assert False, f"Login response does not match contract: {e.message}"


def test_created_task_matches_contract():
    email = random_email()
    password = "contract123"

    requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": password})
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    token = login_response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.post(
        f"{BASE_URL}/api/tasks",
        json={"title": "Contract test task", "description": "Testing the contract"},
        headers=headers
    )

    assert response.status_code == 201
    schema = load_schema("task.schema.json")

    try:
        validate(instance=response.json(), schema=schema)
    except ValidationError as e:
        assert False, f"Created task response does not match contract: {e.message}"


def test_task_list_items_match_contract():
    email = random_email()
    password = "contract123"

    requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": password})
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    token = login_response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    requests.post(f"{BASE_URL}/api/tasks", json={"title": "Task for list check"}, headers=headers)
    response = requests.get(f"{BASE_URL}/api/tasks", headers=headers)

    assert response.status_code == 200
    schema = load_schema("task.schema.json")

    tasks = response.json()
    assert len(tasks) > 0, "Expected at least one task in the list"

    for task in tasks:
        try:
            validate(instance=task, schema=schema)
        except ValidationError as e:
            assert False, f"Task in list does not match contract: {e.message}"
