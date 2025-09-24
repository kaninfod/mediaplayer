import React from 'react';
import { Modal, List, Button, Spin } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

// Types for Subsonic data
export interface Artist {
  id: string;
  name: string;
}
export interface Album {
  id: string;
  name: string;
  year?: string;
}
export interface Song {
  id: string;
  title: string;
  artist?: string;
}

interface MusicModalProps {
  open: boolean;
  loadingArtists: boolean;
  loadingAlbums: boolean;
  loadingSongs: boolean;
  artistsData: { artists: Artist[] } | undefined;
  artistData: { albums: Album[] } | undefined;
  albumData: { songs: Song[] } | undefined;
  selectedArtist: Artist | null;
  selectedAlbum: Album | null;
  onSelectArtist: (artist: Artist) => void;
  onSelectAlbum: (album: Album) => void;
  onPlayAlbum: (albumId: string) => void;
  onPlaySong: (songId: string) => void;
  onBack: () => void;
  onClose: () => void;
}

const MusicModal: React.FC<MusicModalProps> = ({
  open,
  loadingArtists,
  loadingAlbums,
  loadingSongs,
  artistsData,
  artistData,
  albumData,
  selectedArtist,
  selectedAlbum,
  onSelectArtist,
  onSelectAlbum,
  onPlayAlbum,
  onPlaySong,
  onBack,
  onClose,
}) => {
  let modalTitle = 'Artists';
  let modalContent = null;
  if (selectedAlbum && albumData) {
    modalTitle = selectedAlbum.name;
    modalContent = (
      <List
        dataSource={albumData.songs as Song[] || []}
        renderItem={(song: Song) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                shape="circle"
                icon={<PlayCircleOutlined style={{ color: 'green' }} />}
                onClick={() => onPlaySong(song.id)}
                key="play-song"
              />,
            ]}
          >
            <List.Item.Meta title={song.title} description={song.artist} />
          </List.Item>
        )}
      />
    );
  } else if (selectedArtist && artistData) {
    modalTitle = selectedArtist.name;
    modalContent = (
      <List
        dataSource={artistData.albums as Album[] || []}
        renderItem={(album: Album) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                shape="circle"
                icon={<PlayCircleOutlined style={{ color: 'green' }} />}
                onClick={() => onPlayAlbum(album.id)}
                key="play-album"
              />,
            ]}
            onClick={() => onSelectAlbum(album)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta title={album.name} description={album.year} />
          </List.Item>
        )}
      />
    );
  } else if (artistsData) {
    modalContent = (
      <List
        dataSource={artistsData.artists as Artist[] || []}
        renderItem={(artist: Artist) => (
          <List.Item
            onClick={() => onSelectArtist(artist)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta title={artist.name} />
          </List.Item>
        )}
      />
    );
  }

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onClose}
      footer={null}
      width={480}
      bodyStyle={{
        minHeight: '320px',
        height: '80vh',
        maxHeight: '80vh',
        overflowY: 'auto',
        paddingTop: 16,
        paddingBottom: 16,
      }}
      style={{ top: '10vh' }}
    >
      {(loadingArtists || loadingAlbums || loadingSongs) ? (
        <Spin />
      ) : (
        <div style={{ height: '100%', overflowY: 'auto' }}>
          {(selectedArtist || selectedAlbum) && (
            <Button style={{ marginBottom: 16 }} onClick={onBack}>
              Back
            </Button>
          )}
          {modalContent}
        </div>
      )}
    </Modal>
  );
};

export default MusicModal;
