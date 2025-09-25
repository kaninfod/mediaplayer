import { useState } from 'react';
import { Button, Card, Typography, Space, Slider, Row, Col } from 'antd';
import { PauseCircleOutlined, PlayCircleOutlined, StepForwardOutlined, StepBackwardOutlined, SoundOutlined } from '@ant-design/icons';
import MusicModal from './MusicModal';
import type { Artist, Album, Song } from './MusicModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title, Text } = Typography;

// API endpoints
const API_BASE = 'http://192.168.68.104:8000';
const endpoints = {
  currentTrack: '/mediaplayer/current_track',
  playPause: '/mediaplayer/play_pause',
  next: '/mediaplayer/next_track',
  prev: '/mediaplayer/previous_track',
  volumeUp: '/mediaplayer/volume_up',
  volumeDown: '/mediaplayer/volume_down',
  artists: '/subsonic/artists',
  artist: (id: string) => `/subsonic/artist/${id}`,
  album: (id: string) => `/subsonic/album/${id}`,
  playAlbum: (id: string) => `/mediaplayer/play_album_from_albumid/${id}`,
  playSong: (id: string) => `/mediaplayer/play_song/${id}`,
};

async function fetchCurrentTrack() {
  const res = await fetch(API_BASE + endpoints.currentTrack);
  if (!res.ok) throw new Error('Failed to fetch current track');
  return res.json();
}

async function postAction(endpoint: string) {
  const res = await fetch(API_BASE + endpoint, { method: 'POST' });
  if (!res.ok) throw new Error('Action failed');
  return res.json();
}

async function fetchArtists() {
  const res = await fetch(API_BASE + endpoints.artists);
  if (!res.ok) throw new Error('Failed to fetch artists');
  return res.json();
}

async function fetchArtist(id: string) {
  const res = await fetch(API_BASE + endpoints.artist(id));
  if (!res.ok) throw new Error('Failed to fetch artist');
  return res.json();
}

async function fetchAlbum(id: string) {
  const res = await fetch(API_BASE + endpoints.album(id));
  if (!res.ok) throw new Error('Failed to fetch album');
  return res.json();
}

export default function Player() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentTrack'],
    queryFn: fetchCurrentTrack,
    refetchInterval: 2000,
  });

  const mutation = useMutation({
    mutationFn: (endpoint: string) => postAction(endpoint),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentTrack'] }),
  });

  // Music modal state
  const [musicOpen, setMusicOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Fetch artists
  const { data: artistsDataRaw, isLoading: loadingArtists } = useQuery({
    queryKey: ['artists'],
    queryFn: fetchArtists,
    enabled: musicOpen && !selectedArtist,
  });

  // Normalize artists data and log for debugging
  let artistsData: { artists: Artist[] } | undefined = undefined;
  if (artistsDataRaw) {
    console.log('artistsDataRaw', artistsDataRaw);
    if (Array.isArray(artistsDataRaw)) {
      artistsData = { artists: artistsDataRaw };
    } else if ('artists' in artistsDataRaw && Array.isArray(artistsDataRaw.artists)) {
      artistsData = { artists: artistsDataRaw.artists };
    } else {
      // Try to find the first array property
      const arr = Object.values(artistsDataRaw).find(v => Array.isArray(v));
      if (arr) artistsData = { artists: arr as Artist[] };
    }
  }


  // Fetch albums for selected artist
  const { data: artistDataRaw, isLoading: loadingAlbums } = useQuery({
    queryKey: ['artist', selectedArtist?.id],
    queryFn: () => fetchArtist(selectedArtist!.id),
    enabled: !!selectedArtist && !selectedAlbum,
  });

  // Normalize albums data and log for debugging
  let artistData: { albums: Album[] } | undefined = undefined;
  if (artistDataRaw) {
    console.log('artistDataRaw', artistDataRaw);
    if (Array.isArray(artistDataRaw)) {
      artistData = { albums: artistDataRaw };
    } else if ('albums' in artistDataRaw && Array.isArray(artistDataRaw.albums)) {
      artistData = { albums: artistDataRaw.albums };
    } else {
      // Try to find the first array property
      const arr = Object.values(artistDataRaw).find(v => Array.isArray(v));
      if (arr) artistData = { albums: arr as Album[] };
    }
  }


  // Fetch songs for selected album
  const { data: albumDataRaw, isLoading: loadingSongs } = useQuery({
    queryKey: ['album', selectedAlbum?.id],
    queryFn: () => fetchAlbum(selectedAlbum!.id),
    enabled: !!selectedAlbum,
  });

  // Normalize songs data and log for debugging
  let albumData: { songs: Song[] } | undefined = undefined;
  if (albumDataRaw) {
    console.log('albumDataRaw', albumDataRaw);
    if (Array.isArray(albumDataRaw)) {
      albumData = { songs: albumDataRaw };
    } else if ('songs' in albumDataRaw && Array.isArray(albumDataRaw.songs)) {
      albumData = { songs: albumDataRaw.songs };
    } else {
      // Try to find the first array property
      const arr = Object.values(albumDataRaw).find(v => Array.isArray(v));
      if (arr) albumData = { songs: arr };
    }
  }

  // Play album or song
  const playMutation = useMutation({
    mutationFn: (endpoint: string) => postAction(endpoint),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentTrack'] }),
  });

  const handleAction = (endpoint: string) => {
    mutation.mutate(endpoint);
  };

  const handlePlayAlbum = (albumId: string) => {
    playMutation.mutate(endpoints.playAlbum(albumId));
    setMusicOpen(false);
    setSelectedArtist(null);
    setSelectedAlbum(null);
  };

  const handlePlaySong = (songId: string) => {
    playMutation.mutate(endpoints.playSong(songId));
    setMusicOpen(false);
    setSelectedArtist(null);
    setSelectedAlbum(null);
  };

  const handleBack = () => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
    } else if (selectedArtist) {
      setSelectedArtist(null);
    } else {
      setMusicOpen(false);
    }
  };

  if (isLoading) return <Card>Loading...</Card>;
  if (isError) return <Card>Error loading player info</Card>;

  const track = data.current_track || {};

  // Modal content is now handled by MusicModal

  return (
    <>
      <Row justify="center" style={{ marginTop: 40 }}>
        <Col span={24}>
          <Card style={{ position: 'relative' }}>
            <Button
              style={{ position: 'absolute', right: 24, top: 16, zIndex: 10 }}
              onClick={() => setMusicOpen(true)}
            >
              Music
            </Button>
            <Title level={3}>Now Playing</Title>
            <Text strong>{track.title || 'No track'}</Text>
            <br />
            <Text type="secondary">{track.artist}</Text>
            <br />
            <Text type="secondary">{track.album}</Text>
            <br />
            <Text type="secondary">{track.year}</Text>
            <br />
            <Space style={{ marginTop: 24 }}>
              <Button
                icon={<StepBackwardOutlined />}
                onClick={() => handleAction(endpoints.prev)}
                disabled={mutation.isPending}
              />
              <Button
                type="primary"
                shape="circle"
                icon={track.status === 'playing' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                size="large"
                onClick={() => handleAction(endpoints.playPause)}
                disabled={mutation.isPending}
              />
              <Button
                icon={<StepForwardOutlined />}
                onClick={() => handleAction(endpoints.next)}
                disabled={mutation.isPending}
              />
            </Space>
            <div style={{ marginTop: 32 }}>
              <SoundOutlined style={{ marginRight: 8 }} />
              <Button
                size="small"
                onClick={() => handleAction(endpoints.volumeDown)}
                disabled={mutation.isPending}
              >
                -
              </Button>
              <Slider
                min={0}
                max={100}
                value={track.volume || 50}
                style={{ width: 120, display: 'inline-block', margin: '0 8px' }}
                disabled
              />
              <Button
                size="small"
                onClick={() => handleAction(endpoints.volumeUp)}
                disabled={mutation.isPending}
              >
                +
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <MusicModal
        open={musicOpen}
        loadingArtists={loadingArtists}
        loadingAlbums={loadingAlbums}
        loadingSongs={loadingSongs}
        artistsData={artistsData}
        artistData={artistData}
        albumData={albumData}
        selectedArtist={selectedArtist}
        selectedAlbum={selectedAlbum}
        onSelectArtist={setSelectedArtist}
        onSelectAlbum={setSelectedAlbum}
        onPlayAlbum={handlePlayAlbum}
        onPlaySong={handlePlaySong}
        onBack={handleBack}
        onClose={() => {
          setMusicOpen(false);
          setSelectedArtist(null);
          setSelectedAlbum(null);
        }}
      />
    </>
  );
}
