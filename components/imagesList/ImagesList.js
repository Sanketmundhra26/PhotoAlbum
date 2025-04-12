import styles from "./imageList.module.css";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "react-spinner-material";

// Importing required components
import { ImageForm } from "../imageForm/ImageForm";
import { Carousel } from "../carousel/Carousel";

// Firebase utilities
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  Timestamp,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

let IMAGE_CACHE;

export const ImagesList = ({ albumId, albumName, onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef();

  // Fetch images from Firebase
  const fetchImages = async () => {
    setLoading(true);
    const imagesCollection = collection(db, "albums", albumId, "images");
    const imageDocs = await getDocs(query(imagesCollection, orderBy("created", "desc")));
    const fetchedImages = imageDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setImages(fetchedImages);
    IMAGE_CACHE = fetchedImages;
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);

  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const showPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };
  
  const closeCarousel = () => setCurrentImageIndex(null);

  const toggleSearch = () => {
    if (searchActive) {
      searchInputRef.current.value = "";
      fetchImages();
    }
    setSearchActive(!searchActive);
  };

  const filterImages = () => {
    const query = searchInputRef.current.value;
    if (!query) return IMAGE_CACHE;

    setImages(IMAGE_CACHE.filter((image) => image.title.includes(query)));
  };

  // Function to add a new image
  const addImage = async ({ title, url }) => {
    setIsImageLoading(true);
    const newImageRef = await addDoc(collection(db, "albums", albumId, "images"), {
      title,
      url,
      created: Timestamp.now(),
    });
    setImages((prev) => [{ id: newImageRef.id, title, url }, ...prev]);
    toast.success("Image successfully added.");
    setIsImageLoading(false);
  };

  // Function to update an existing image
  const updateImage = async ({ title, url }) => {
    setIsImageLoading(true);
    const imageRef = doc(db, "albums", albumId, "images", isUpdatingImage.id);

    await setDoc(imageRef, { title, url });
    setImages(images.map((img) => (img.id === imageRef.id ? { id: imageRef.id, title, url } : img)));
    toast.success("Image successfully updated.");
    setIsImageLoading(false);
    setIsUpdatingImage(false);
  };

  // Function to delete an image
  const deleteImage = async (event, id) => {
    event.stopPropagation();
    await deleteDoc(doc(db, "albums", albumId, "images", id));
    setImages(images.filter((img) => img.id !== id));
    toast.success("Image successfully deleted.");
  };

  if (!images.length && !searchInputRef.current?.value && !loading) {
    return (
      <>
        <div className={styles.top}>
          <span onClick={onBack}>
            <img src="/assets/back.png" alt="Back" />
          </span>
          <h3>No images available in this album.</h3>
          <button className={`${isAddingImage && styles.active}`} onClick={() => setIsAddingImage(!isAddingImage)}>
            {!isAddingImage ? "Add Image" : "Cancel"}
          </button>
        </div>
        {isAddingImage && <ImageForm loading={isImageLoading} onAdd={addImage} albumName={albumName} />}
      </>
    );
  }

  return (
    <>

      {(isAddingImage || isUpdatingImage) && 
      <ImageForm loading={isImageLoading} 
      onAdd={addImage} albumName={albumName} 
      onUpdate={updateImage} updateIntent={isUpdatingImage} 
      />}

      {(currentImageIndex !== null) && 
      <Carousel title={images[currentImageIndex].title} 
      url={images[currentImageIndex].url} onNext={showNextImage} 
      onPrev={showPreviousImage} 
      onCancel={closeCarousel} />}
      <div className={styles.top}>

        <span onClick={onBack}>
          <img src="/assets/back.png" alt="Back" />
        </span>

        <h3>Images in {albumName}</h3>

        <div className={styles.search}>

          {searchActive && <input placeholder="Search..." 
          onChange={filterImages} ref={searchInputRef} autoFocus
           />}

          <img onClick={toggleSearch}
           src={!searchActive ? "/assets/search.png" : "/assets/clear.png"} alt="Search" 
           />

        </div>

        {isUpdatingImage ? 
        <button className={styles.active} onClick={() => 
        setIsUpdatingImage(false)}>
          Cancel
          </button> : 
          <button className={`${isAddingImage && styles.active}`}
         onClick={() => 
         setIsAddingImage(!isAddingImage)}>
          {!isAddingImage ? "Add Image" : "Cancel"}
         </button>
         }

      </div>
      {loading && <div className={styles.loader}><Spinner color="#0077ff" />
      </div>}
      {!loading && <div className={styles.imageList}>{images.map((image, i) => 
        (<div key={image.id} className={styles.image} onMouseOver={() => 
        setHoveredImageIndex(i)} 
        onMouseOut={() => setHoveredImageIndex(null)} 
        onClick={() => setCurrentImageIndex(i)}>

          <div className={`${styles.update} ${hoveredImageIndex === i && styles.active}`} 

          onClick={(e) => { e.stopPropagation(); setIsUpdatingImage(image); 
        
          }}>
            <img src="/assets/edit.png" alt="Update" /></div>
            <div className={`${styles.delete} ${hoveredImageIndex === i && styles.active}`} 

            onClick={(e) => deleteImage(e, image.id)}>
              <img src="/assets/trash-bin.png" alt="Delete" />

              </div>
            <img src={image.url} alt={image.title}
             onError={({ currentTarget }) => 
             { currentTarget.src = "/assets/warning.png"; }} 
             />
            <span>
              {image.title.substring(0, 20)}
            </span>
            </div>))}
            </div>}
    </>
  );
};
