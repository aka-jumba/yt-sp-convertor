# save this as app.py
import os
import re
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import sys

app = Flask(__name__)
cors = CORS(app)
credentials = None
app.config['credentials'] = None
SCOPES = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl',
          'https://www.googleapis.com/auth/youtubepartner']
CLIENT_SECRETS = ["client_secret.json", "client_secret-1.json", "client_secret-2.json"]
API_KEYS_YOUTUBE = ['AIzaSyAYg6xDI-6WFJTuhjLn4Laon854ul8TVBQ', "AIzaSyAkL3f37KL47XWnh9dR1HdcUGGCddeoAZY",
                    "AIzaSyAH_Hm9kYNFIJIv-iHVBVXqNixJpMBmpBc"]
app.config['CORS_HEADERS'] = 'Content-Type'
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id="b3fcb55c0ddb41d3953a9244922e46d4",
                                               client_secret="ffd69ff41cf94ebda2647276d02f2e38",
                                               redirect_uri="https://example.com/callback",
                                               scope="user-library-read,playlist-modify-private,playlist-modify-public"))


@app.route("/")
def hello():
    return "Hello, World!"


def set_credentials(secret_file_name, credentials, auth_num):
    CLIENT_SECRETS_FILE = secret_file_name
    if os.path.exists("token_" + str(auth_num) + ".pickle"):
        print('Loading Credentials From File...')
        with open("token_" + str(auth_num) + ".pickle", 'rb') as token:
            credentials = pickle.load(token)
            app.config['credentials'] = credentials
    if not app.config['credentials'] or not app.config['credentials'].valid:
        if app.config['credentials'] and app.config['credentials'].expired and app.config['credentials'].refresh_token:
            print('Refreshing Access Token...')
            app.config['credentials'].refresh(Request())
        else:
            print('Fetching New Tokens...')
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
            flow.run_local_server(port=8080, prompt="consent", authorization_prompt_message="")
            credentials = flow.credentials
            with open("token_" + str(auth_num) + ".pickle", 'wb') as f:
                print('Saving Credentials for Future Use...')
                pickle.dump(credentials, f)
    app.config['credentials'] = credentials


def clean_title(title, artist):
    title = title.lower()
    artist = artist.lower()
    title = title.split('|')[0].strip()
    groups = re.findall(
        '^(.*)(?:\(.*\)).*$',
        title)
    if len(groups) != 0:
        title = groups[0].strip()
    groups = re.findall(
        '^(.*)(?:\[.*\]).*$',
        title)
    if len(groups) != 0:
        title = groups[0].strip()

    if artist != "":
        title = title.replace(artist, "").strip()
    title = title.replace("-", "").strip()
    title = title.split("by")[0].strip()
    title = title.split("sung")[0].strip()
    title = title.split("lyric")[0].strip()
    return title


def clean_owner(video_owner):
    video_owner = video_owner.lower()
    video_owner = video_owner.replace("topic", "").strip()
    video_owner = video_owner.replace("vevo", "").strip()
    return video_owner.replace("-", "").strip()


def create_playlist(title, status, youtube):
    request1 = youtube.playlists().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": "This is a sample playlist description.",
                "tags": [
                    "sample playlist",
                    "API call"
                ],
                "defaultLanguage": "en"
            },
            "status": {
                "privacyStatus": status
            }
        }
    )
    response = request1.execute()
    return response['id']


def search_youtube(video, next_page_token, youtube):
    request1 = youtube.search().list(
        part="snippet",
        q=video["videoOwner"] + "-" + video["title"],
        pageToken=next_page_token,
        fields="items(id, snippet / title, snippet / channelTitle, id / videoId)"
    )
    return request1.execute()


def search_repeat_youtube(video, next_page_token):
    response = None
    attempts = 0
    app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
    youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
    is_successful = False
    while attempts < len(API_KEYS_YOUTUBE):
        try:
            response = search_youtube(video, next_page_token, youtube)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            app.config["credentials"] = None
            attempts += 1
            if attempts >= len(API_KEYS_YOUTUBE):
                break
            app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
            youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
        finally:
            if is_successful:
                break
    return response


def insert_video(playlist_id, video_id, count, youtube):
    request1 = youtube.playlistItems().insert(
        part="snippet",
        body={
            "snippet": {
                "playlistId": playlist_id,
                "position": count,
                "resourceId": {
                    "kind": "youtube#video",
                    "videoId": video_id
                }
            }
        }
    )
    return request1.execute()


def insert_video_repeat_youtube_auth(new_playlist_id, video_id, count):
    response = None
    attempts = 0
    set_credentials(CLIENT_SECRETS[attempts], None, attempts)
    youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
    is_successful = False
    while attempts < len(CLIENT_SECRETS):
        try:
            response = insert_video(new_playlist_id, video_id, count, youtube_authenticated)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            app.config["credentials"] = None
            attempts += 1
            if attempts >= len(CLIENT_SECRETS):
                break
            set_credentials(CLIENT_SECRETS[attempts], None, attempts)
            youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
        finally:
            if is_successful:
                break
    return response


def is_playlist_not_private(playlist_id, youtube):
    request1 = youtube.playlists().list(
        part="status",
        id=playlist_id,
        fields="items/status/privacyStatus"
    )
    response = request1.execute()
    return response['items'][0]['status']['privacyStatus'] == "public" or response['items'][0]['status'][
        'privacyStatus'] == "unlisted"


def is_playlist_not_private_repeat(playlist_id):
    response = None
    attempts = 0
    app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
    youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
    is_successful = False
    while attempts < len(API_KEYS_YOUTUBE):
        try:
            response = is_playlist_not_private(playlist_id, youtube)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            attempts += 1
            if attempts >= len(API_KEYS_YOUTUBE):
                break
            app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
            youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
        finally:
            if is_successful:
                break
    return response


def get_playlist_item_youtube(playlist_id, next_page_token, youtube):
    request1 = youtube.playlistItems().list(
        part='contentDetails,id,snippet,status',
        playlistId=playlist_id,
        pageToken=next_page_token,
        maxResults=50
    )
    return request1.execute()


def get_playlist_item_repeat_youtube(playlist_id, next_page_token):
    response = None
    attempts = 0
    app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
    youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
    is_successful = False
    while attempts < len(API_KEYS_YOUTUBE):
        try:
            response = get_playlist_item_youtube(playlist_id, next_page_token, youtube)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            attempts += 1
            if attempts >= len(API_KEYS_YOUTUBE):
                break
            # set_credentials(CLIENT_SECRETS[attempts], None, attempts)
            app.config['yt_api_key'] = API_KEYS_YOUTUBE[attempts]
            youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
        finally:
            if is_successful:
                break
    return response


def get_playlist_item_repeat_youtube_auth(playlist_id, next_page_token):
    response = None
    attempts = 0
    set_credentials(CLIENT_SECRETS[attempts], None, attempts)
    youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
    is_successful = False
    while attempts < len(CLIENT_SECRETS):
        try:
            response = get_playlist_item_youtube(playlist_id, next_page_token, youtube_authenticated)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            app.config["credentials"] = None
            attempts += 1
            if attempts >= len(CLIENT_SECRETS):
                break
            set_credentials(CLIENT_SECRETS[attempts], None, attempts)
            youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
        finally:
            if is_successful:
                break
    return response


def create_playlist_repeat_youtube_auth(new_playlist_title, status):
    response = None
    attempts = 0
    set_credentials(CLIENT_SECRETS[attempts], None, attempts)
    youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
    is_successful = False
    while attempts < len(CLIENT_SECRETS):
        try:
            response = create_playlist(new_playlist_title, status, youtube_authenticated)
            is_successful = True
        except:
            e = sys.exc_info()[0]
            print(e)
            app.config["credentials"] = None
            attempts += 1
            if attempts >= len(CLIENT_SECRETS):
                break
            set_credentials(CLIENT_SECRETS[attempts], None, attempts)
            youtube_authenticated = build('youtube', 'v3', credentials=app.config['credentials'])
        finally:
            if is_successful:
                break
    return response


@app.route('/api/sp-yt/playlist', methods=["POST"])
def sp_to_yt_playlist_controller():
    videos_list = []
    sp_yt_mapping = []
    unmapped = []
    if request.method == 'POST' and request.data:
        playlist_id = request.json['playlistId']
        new_playlist_title = request.json["playlist_name"]
        limit = 50
        offset = 0
        total = 1000
        while offset < total:
            tracks = sp.playlist_items(playlist_id, limit=limit, offset=offset)
            total = tracks['total']
            if len(tracks['items']) == 0:
                break
            offset += limit
            for track in tracks['items']:
                video_owner = clean_owner(track['track']['artists'][0]['name'])
                video_info = {'videoId': track['track']['uri'],
                              'title': clean_title(track['track']['name'], video_owner),
                              "videoOwner": video_owner}
                videos_list.append(video_info)

        for video in videos_list:
            next_page_token = ""
            end_of_call = False
            hard_max = 100
            current = 0
            matched = False
            while not end_of_call and current < hard_max:
                response = search_repeat_youtube(video, next_page_token)
                if response == None:
                    return jsonify(videos_list=videos_list)
                if len(response['items']) == 0:
                    break
                current += len(response['items'])
                if 'nextPageToken' not in response:
                    end_of_call = True
                else:
                    next_page_token = response['nextPageToken']
                for yt_video in response['items']:
                    if video['title'] in yt_video['snippet']['title'].lower() or video['videoOwner'] in \
                            yt_video['snippet'][
                                'channelTitle'].lower():
                        best_match = {'sp_uri': video["videoId"], 'artist': video["videoOwner"],
                                      'yt_video_id': yt_video['id']['videoId'],
                                      'yt_video_owner': yt_video['snippet']['channelTitle'],
                                      'title': yt_video['snippet']['title']}
                        matched = True
                        print(best_match)
                        sp_yt_mapping.append(best_match)
                        end_of_call = True
                        break
            if not matched:
                unmapped.append(video)
        new_playlist_id = create_playlist_repeat_youtube_auth(new_playlist_title, "private")
        count = 0
        for video_mapping in sp_yt_mapping:
            insert_video_repeat_youtube_auth(new_playlist_id, video_mapping['yt_video_id'], count)
            count += 1

    return jsonify(videos_list=sp_yt_mapping)


@app.route('/api/yt-sp/playlist', methods=["POST"])
def yt_to_sp_playlist_controller():
    videos_list = []
    yt_sp_mapping = []
    unmapped = []
    if request.method == 'POST' and request.data:
        playlist_id = request.json['playlistId']
        new_playlist_name = request.json['playlist_name']
        is_not_private = is_playlist_not_private_repeat(playlist_id)
        next_page_token = ""
        end_of_call = False
        while not end_of_call:
            response = None
            if is_not_private:
                response = get_playlist_item_repeat_youtube(playlist_id, next_page_token)
            else:
                response = get_playlist_item_repeat_youtube_auth(playlist_id, next_page_token)
            if response == None:
                break
            if 'nextPageToken' not in response:
                end_of_call = True
            else:
                next_page_token = response['nextPageToken']
            for item in response['items']:
                video_info = {'videoId': item['contentDetails']['videoId'], 'title': item['snippet']['title'],
                              "videoOwner": item['snippet']['videoOwnerChannelTitle']}
                videos_list.append(video_info)

        for video in videos_list:
            limit = 50
            offset = 0
            hard_max = 500
            video['videoOwner'] = clean_owner(video['videoOwner'])
            best_artist = {'uri': "", 'name': "", "followers": 5000}
            while offset < hard_max:
                spotify_artists = sp.search(q=video['videoOwner'], type='artist', offset=offset, limit=limit)
                artists = spotify_artists['artists']
                if len(artists['items']) == 0:
                    break
                offset += limit
                for artist in artists['items']:
                    if artist['followers']['total'] > best_artist['followers'] and artist['name'].lower() in video[
                        'videoOwner']:
                        best_artist['uri'] = artist['uri']
                        best_artist['name'] = artist['name']
                        best_artist['followers'] = artist['followers']['total']

            best_match = {'uri': "", 'artist': "", 'popularity': 0, 'yt_video_id': video['videoId'],
                          'yt_video_owner': video['videoOwner']}
            print(best_artist)
            video['title'] = clean_title(video['title'], best_artist['name'])
            if video['title'] == "":
                continue
            offset = 0
            while offset < hard_max:
                q = ""
                if best_artist['name'] == "":
                    q = video['title']
                else:
                    q = best_artist['name'] + " " + video['title']
                spotify_tracks = sp.search(q=q, type='track', offset=offset, limit=limit)
                tracks = spotify_tracks['tracks']
                if len(tracks['items']) == 0:
                    break
                offset += limit
                for track in tracks['items']:
                    if track['popularity'] > best_match['popularity']:
                        best_match['uri'] = track['uri']
                        best_match['artist'] = track['artists'][0]['name']
                        best_match['popularity'] = track['popularity']
            print(best_match)
            if best_match['uri'] != '':
                yt_sp_mapping.append(best_match)
            else:
                unmapped.append(video)
        user_id = sp.me()['id']
        created_playlist_response = sp.user_playlist_create(user_id, new_playlist_name)
        sp_playlist_id = created_playlist_response['id']
        uris_list = [matched['uri'] for matched in yt_sp_mapping]
        for i in range(0, len(uris_list), 100):
            sp.playlist_add_items(sp_playlist_id, uris_list[i:i + 100])
        for video in unmapped:
            print(video)
    return jsonify(videos_list=yt_sp_mapping)


# @app.route('/api/yt-sp/get-playlists', methods=["POST"])
# def yt_to_sp_get_playlists_controller():
#     playlist_list = []
#     channel_id = request.json['channelId']
#     if request.method == 'POST' and request.data:
#         next_page_token = ""
#         end_of_call = False
#         while not end_of_call:
#             request1 = youtube.playlists().list(
#                 part='contentDetails,id,snippet,status',
#                 channelId=channel_id,
#                 pageToken=next_page_token,
#                 maxResults=50
#             )
#             response = request1.execute()
#             if 'nextPageToken' not in response:
#                 end_of_call = True
#             else:
#                 next_page_token = response['nextPageToken']
#             for playlist in response['items']:
#                 playlist_list.append(playlist['id'])
#
#     return jsonify(playlist_list=playlist_list)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
