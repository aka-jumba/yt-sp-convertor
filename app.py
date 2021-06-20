# save this as app.py
import pprint
import re

from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
import spotipy
from spotipy.oauth2 import SpotifyOAuth

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['yt_api_key'] = 'AIzaSyAYg6xDI-6WFJTuhjLn4Laon854ul8TVBQ'
youtube = build('youtube', 'v3', developerKey=app.config['yt_api_key'])
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id="b3fcb55c0ddb41d3953a9244922e46d4",
                                               client_secret="ffd69ff41cf94ebda2647276d02f2e38",
                                               redirect_uri="https://example.com/callback",
                                               scope="user-library-read,playlist-modify-private,playlist-modify-public"))


@app.route("/")
def hello():
    return "Hello, World!"


@app.route('/api/yt-sp/song', methods=["POST"])
def yt_to_sp_song_controller():
    if request.method == 'POST' and request.data:
        song_title = request.json['song_title']
        print("song title sent is ", song_title)

    return jsonify(message="song added to spotify playlist")


def clean_title(title):
    title = title.split('|')[0].strip()
    if "(" in title:
        groups = re.findall(
            '^(.*)(?:\(.*\))$',
            title)
        title = groups[0]
    if "[" in title:
        groups = re.findall(
            '^(.*)(?:\[.*\])$',
            title)
        title = groups[0]
    return title


def clean_owner(artist):
    return artist.split('-')[0].strip()


@app.route('/api/yt-sp/playlist', methods=["POST"])
def yt_to_sp_playlist_controller():
    videos_list = []
    if request.method == 'POST' and request.data:
        playlist_id = request.json['playlistId']
        next_page_token = ""
        end_of_call = False
        while not end_of_call:
            request1 = youtube.playlistItems().list(
                part='contentDetails,id,snippet,status',
                playlistId=playlist_id,
                pageToken=next_page_token,
                maxResults=50
            )
            response = request1.execute()
            if 'nextPageToken' not in response:
                end_of_call = True
            else:
                next_page_token = response['nextPageToken']
            for item in response['items']:
                video_info = {'videoId': item['contentDetails']['videoId'], 'title': item['snippet']['title'],
                              "videoOwner": item['snippet']['videoOwnerChannelTitle']}
                videos_list.append(video_info)

    yt_sp_mapping = []
    unmapped = []
    for video in videos_list:
        video['title'] = clean_title(video['title'])
        if video['title'] == "":
            continue
        video['videoOwner'] = clean_owner(video['videoOwner'])
        limit = 50
        offset = 0
        hard_max = 500

        best_artist = {'uri': "", 'name': "", "followers": 5000}
        while offset < hard_max:
            spotify_artists = sp.search(q=video['videoOwner'], type='artist', offset=offset, limit=limit)
            artists = spotify_artists['artists']
            if len(artists['items']) == 0:
                break
            offset += limit
            for artist in artists['items']:
                if artist['followers']['total'] > best_artist['followers']:
                    best_artist['uri'] = artist['uri']
                    best_artist['name'] = artist['name']
                    best_artist['followers'] = artist['followers']['total']

        best_match = {'uri': "", 'artist': "", 'popularity': 0, 'yt_video_id': video['videoId'],
                      'yt_video_owner': video['videoOwner']}
        print(best_artist)
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
    created_playlist_response = sp.user_playlist_create(user_id, "api_gen_playlist")
    sp_playlist_id = created_playlist_response['id']
    uris_list = [matched['uri'] for matched in yt_sp_mapping]
    for i in range(0, len(uris_list), 100):
        sp.playlist_add_items(sp_playlist_id, uris_list[i:i + 100])
    for video in unmapped:
        print(video)
    return jsonify(videos_list=yt_sp_mapping)

#parse title correct -- look out for pattern/ ml model
#if two artist present issue

# {'videoId': 'JaiAWU2PVO4', 'title': 'Prateek Kuhad', 'videoOwner': 'Soulful Tracks Only'}
# {'videoId': 'T5ljN3069KA', 'title': 'Aa Jaao ', 'videoOwner': 'Ankur Tewari'}
# {'videoId': 'tnyG99T5Zrs', 'title': 'Sung By Ankur Tewari & Prateek Kuhad', 'videoOwner': 'Shruti Sinha'}
# {'videoId': 'AxrCKwLcAzM', 'title': 'Saansein Video Song', 'videoOwner': 'T'}
# {'videoId': '9Eg4d56rt-U', 'title': 'Neele Neele Ambar Par ', 'videoOwner': 'Kishore Kumar'}
# {'videoId': 'hyFDEoFEPWY', 'title': 'Raah Mein Unse Mulaqat ', 'videoOwner': 'Alka Yagnik'}


@app.route('/api/yt-sp/get-playlists', methods=["POST"])
def yt_to_sp_get_playlists_controller():
    playlist_list = []
    channel_id = request.json['channelId']
    if request.method == 'POST' and request.data:
        next_page_token = ""
        end_of_call = False
        while not end_of_call:
            request1 = youtube.playlists().list(
                part='contentDetails,id,snippet,status',
                channelId=channel_id,
                pageToken=next_page_token,
                maxResults=50
            )
            response = request1.execute()
            if 'nextPageToken' not in response:
                end_of_call = True
            else:
                next_page_token = response['nextPageToken']
            for playlist in response['items']:
                playlist_list.append(playlist['id'])

    return jsonify(playlist_list=playlist_list)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
