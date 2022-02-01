import asyncio
import json
import time
import aiohttp
import random
import string


async def fetch(session, url, user):
    async with session.get(url, data={"email": user}) as response:
        resp = await response.json(content_type=None)
        return resp


async def post(session, url, user):
    async with session.post(url, data={"email": user, "password": "testpaSS1234!"}) as response:
        resp = await response.json(content_type=None)
        return resp


async def fetch_10000(users):
    """ Gather many HTTP call made async
    Args:
        users: a list of string
    Return:
        responses: A list of dict like object containing http response
    """
    async with aiohttp.ClientSession() as session:
        session.headers.add("authorization", "write_token_1")
       # session.headers.add("Content-Type", "application/json")
        tasks = []
        for user in users:
            tasks.append(
                fetch(
                    session,
                    "http://t11-api:7000/user",
                    user
                )
            )
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        res = str(responses)
        return res


async def post_10000(users):
    """ Gather many HTTP call made async
    Args:
        users: a list of string
    Return:
        responses: A list of dict like object containing http response
    """
    async with aiohttp.ClientSession() as session:
        session.headers.add("authorization", "write_token_1")
       # session.headers.add("Content-Type", "application/json")
        tasks = []
        for user in users:
            tasks.append(
                post(
                    session,
                    "http://t11-api:7000/createUser",
                    user
                )
            )
        responses = await asyncio.gather(*tasks)
        res = str(responses)
        return res


def random_char(char_num):
    return ''.join(random.choice(string.ascii_letters) for _ in range(char_num))


def main():
    users = []
    i = 0
    while i < 200:
        users.append(random_char(7) + "@gmail.com")
        i += 1
    f = open("result.txt", "a")
    print(1)

    start_time_post = time.time()
    print(2)
    responses_post = asyncio.run(post_10000(users))
    print(3)
    end_time_post = time.time()
    print(4)
    f.write('Post took ' + str(end_time_post-start_time_post) + ' and following is the result: \n')
    for response in responses_post:
        f.write(str(response) + "\n")

    start_time_get = time.time()
    responses_get = asyncio.run(fetch_10000(users))
    end_time_get = time.time()
    f.write('Get took ' + str(end_time_get-start_time_get) + ' and following is the result: \n')
    for response in responses_get:
        f.write(str(response) + "\n")

    f.close()
    while True:
        time.sleep(30)


if __name__ == "__main__":
    main()
