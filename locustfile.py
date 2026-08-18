import random
import string
from locust import HttpUser, task, between


class TaskManagerUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        random_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.email = f"loadtest_{random_suffix}@test.com"
        self.password = "loadtest123"

        self.client.post("/api/auth/register", json={
            "email": self.email,
            "password": self.password
        })

        response = self.client.post("/api/auth/login", json={
            "email": self.email,
            "password": self.password
        })

        if response.status_code == 200:
            self.token = response.json().get("token")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = None
            self.headers = {}

    @task(3)
    def get_all_tasks(self):
        if self.headers:
            self.client.get("/api/tasks", headers=self.headers)

    @task(2)
    def create_task(self):
        if self.headers:
            self.client.post("/api/tasks", json={
                "title": "Load test task",
                "description": "Created during a load test"
            }, headers=self.headers)

    @task(1)
    def get_task_not_found(self):
        if self.headers:
            with self.client.get("/api/tasks/999999", headers=self.headers, catch_response=True) as response:
                if response.status_code == 404:
                    response.success()
                else:
                    response.failure(f"Expected 404, got {response.status_code}")
