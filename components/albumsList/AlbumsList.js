import styles from "./albumsList.module.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "react-spinner-material";

// Firebase imports
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase";

// Component imports
import { AlbumForm } from "../albumForm/AlbumForm";
import { ImagesList } from "../imagesList/ImagesList";

export const AlbumsList = () => {
  // State to hold album data
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [albumAddLoading, setAlbumAddLoading] = useState(false);

  // Fetch albums from Firestore
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const albumsRef = collection(db, "albums");
      const snapshot = await getDocs(query(albumsRef, orderBy("created", "desc")));
      
      const albumList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAlbums(albumList);
    } catch (error) {
      console.error("Error fetching albums:", error);
      toast.error("Failed to load albums.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Handle new album addition
  const addAlbum = async (name) => {
    if (albums.some((album) => album.name === name)) {
      return toast.error("Album name already exists.");
    }
    setAlbumAddLoading(true);
    try {
      const albumRef = await addDoc(collection(db, "albums"), {
        name,
        created: Timestamp.now(),
      });
      setAlbums((prevAlbums) => [{ id: albumRef.id, name }, ...prevAlbums]);
      toast.success("Album added successfully.");
    } catch (error) {
      console.error("Error adding album:", error);
      toast.error("Failed to add album.");
    }
    setAlbumAddLoading(false);
  };

  // UI state handlers
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Handle album selection
  const toggleAlbumSelection = (name) => {
    setSelectedAlbum((prev) => (prev === name ? null : name));
  };

  // Reset active album
  const goBack = () => setSelectedAlbum(null);

  // Show message if no albums exist
  if (!loading && albums.length === 0) {
    return (
      <>
        <div className={styles.top}>
          <h3>No albums available.</h3>
          <button onClick={() => setIsCreatingAlbum(!isCreatingAlbum)}>
            {isCreatingAlbum ? "Cancel" : "Create Album"}
          </button>
        </div>
        {isCreatingAlbum && <AlbumForm onAdd={addAlbum} />}
      </>
    );
  }

  // Show loader while fetching albums
  if (loading) {
    return (
      <div className={styles.loader}>
        <Spinner color="#0077ff" />
      </div>
    );
  }

  return (
    <>
      {isCreatingAlbum && !selectedAlbum && (
        <AlbumForm loading={albumAddLoading} onAdd={addAlbum} />
      )}
      {!selectedAlbum ? (
        <div>
          <div className={styles.top}>
            <h3>Your Albums</h3>
            <button
              className={isCreatingAlbum ? styles.active : ""}
              onClick={() => setIsCreatingAlbum(!isCreatingAlbum)}
            >
              {isCreatingAlbum ? "Cancel" : "Add Album"}
            </button>
          </div>
          <div className={styles.albumsList}>
            {albums.map((album) => (
              <div
                key={album.id}
                className={styles.album}
                onClick={() => toggleAlbumSelection(album.name)}
              >
                <img src="/assets/photos.png" alt="Album Cover" />
                <span>{album.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ImagesList
          albumId={albums.find((album) => album.name === selectedAlbum).id}
          albumName={selectedAlbum}
          onBack={goBack}
        />
      )}
    </>
  );
};
