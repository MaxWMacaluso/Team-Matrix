import React, {useState, useEffect} from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, BrowserRouter as Router } from "react-router-dom";

import { BASE_API_URL, BG_WITH_SCREEN, BG_GENERIC } from '../utils/constants';
import CarUIMoveable from './CarUIMoveable'; //'./' is current folder
import ImageSelector from './ImageSelector';
import Loading from './Loading';

import _ from 'lodash';
//TODO: Don't need?
//import FileUpload from '../components/FileUpload';
//import ReactDOM from 'react-dom'
//import { useParams, RouteComponentProps } from "react-router";

// var value = "target"
//
// var element = <CarUIMoveable id = "carUIMoveable" moveableTarget={value} />;
//
// function changeClass(){
//   if (value == "target")
//     value = "temp"
//   else
//     value = "target"
//   element.resetState;
// }

const CarUI = () => {
  // Variables for Moveable
  const [moveableComponentReference, setMoveableCommponentReference] = useState(React.createRef());
  const [begin, setBegin] = useState(null);
  const [end, setEnd] =  useState(null);

  //Handle Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //Image variables
  const [imgs, setImgs] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [localCopy, setLocalCopy] = useState(null);
  const location = useLocation();

  const [undoStack, setUndoStack] = useState([]);
  var undoStack2 = [];

  function getQueryParams() {
    var temp = location.search;
    temp = temp.split("?")[1]
    temp = temp.split(/=|\&/g);
    var queryParams = {};
    for (var i = 0; i < temp.length; i +=2) {
      queryParams[temp[i]] = temp[i+1]
    }
    return queryParams
  }

  var queryParams = null;
  try
  {
    queryParams = getQueryParams();
  }
  catch (e)
  {

  }

  console.log("Query Params: ", queryParams)
  console.log("------------------------------")
  const [tick, setTick] = useState(false);
  const user_token = localStorage.getItem('user_token');


  useEffect(() => {
    if (tick == 0) {
      getImg();
    }
    setTick(1)
  });

  function setImagesFromJSON(data){
    setImgs(data.map((d) => <div>{console.log(<li key={d.img_source}>{d.img_source}</li>)}<img id = "placedImage" className={"moveable"+d.img_id} src = {d.img_source} alt="Set Image" style = {{transform: d.img_transform, transformOrigin: d.img_transform_origin, zIndex: d.img_z_index}} /></div>));
  }

  function getImg() {
    //saveImgFun()
    console.log("getImg() || Location:", location);
    console.log("------------------------------")
    // console.log(`http://localhost:3001/images-by-profile?access_token=${user_token}`)
        fetch(`${BASE_API_URL}/images-by-profile?access_token=${user_token}`)
          .then(response => {
            return response.text();
          })
          .then(data => {
            console.log("getImg() || Data Retrieved: ", data)
            console.log("------------------------------")

            setImgs("ee")

            var newImageLines = <div></div>
            for (var row of data) {
              var className = `moveable_${row.img_id}`;
              newImageLines += <img id = "placedImage" className={className} src = {row.img_source} alt="User's Image" style = ""/>
            }

            data = JSON.parse(data)
            // data =[{"name":"test1"},{"name":"test2"}];

            console.log("getImg() || Type of Data: ", typeof data);
            console.log("------------------------------")

            setLoaded(true);
            //Changed to console.log instead to keep UI clean
              //Was populating screen with image sources before change
            setImagesFromJSON(data)
            // setLocalCopy(data);
            setLocalCopyWithUndo(data)

            console.log("logging undo stack");
            console.log(undoStack);
            // setImgs(<div><div dangerouslySetInnerHTML={{__html: newImageLines}} ></div><h2>Here</h2></div>);
          });
  }

  //Corresponds to "Delete Image" button on the car_ui_page
  function getPageData() {
    // Copying Local copy to temp variable
    var temp = JSON.parse(JSON.stringify(localCopy));
    if (temp == null) {
      console.log("WHOOPS SOMETHING IS NULL")

      return null;
    }
    for (var i = 0; i < temp.length; i++) {
      temp[i].img_transform = document.querySelector(".moveable" + temp[i].img_id + "").style.transform;
      temp[i].img_transform_origin = document.querySelector(".moveable" + temp[i].img_id + "").style.transformOrigin;
      temp[i].img_z_index = document.querySelector(".moveable" + temp[i].img_id + "").style.zIndex;
    }
    return temp;
  }

  function saveImgFun() {
    if (localCopy == null) {
      return;
    }
    setLocalCopyFromPageData()

    console.log('begin save attempt')
    console.log("getImg() || Local Copy: ", localCopy)
    console.log("------------------------------")

    fetch(`${BASE_API_URL}/update-image-transforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localCopy)

    })
    .then(response => {
            return response.text();
    })
    .then(data => {
            alert("Save Successful!");
            getImg();
    });
  }

//Example of localCopy object:
// 0:
//   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlX2lkIjoiMTIiLCJwcm9maWxlX25hbWUiOiJtYXgiLCJpYXQiOjE2MDUwNTQ3NTN9.0BuaQj2GJExeEM9ots_FRqCs7SAbtuYYRg6ed128mA8"
//   id: "194"
//   img_id: "83"
//   img_source: "http://localhost:3001/uploads/default_images/HMI-Widgets_1A.png"
//   img_transform: "translate(331px, 92px) rotate(0deg) scale(0.077193, 0.0535714)"
//   img_transform_origin: "50% 50%"
//   profile_id: "12"

  //Corresponds to "Delete Image" button on the car_ui_page
  function deleteImgFun()
  {
    if (localCopy == null)
    {
      return;
    }
    setLocalCopyFromPageData()

    console.log("deleteImgFun() || Local Copy", localCopy)
    console.log("------------------------------")

    fetch(`${BASE_API_URL}/update-image-transforms`,
    {
      method: 'POST',
      headers:
      {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localCopy)

    })
    .then(response =>
      {
        return response.text()
      })
        .then(data =>
          {
            alert("Delete Successful!")
            getImg()
          })
  }

  function addImage (img_source) {
    // let img_source = prompt('Enter image source');
    let img_transform = `translate(0px, 0px)`+  ` rotate(0deg)`+ ` scale(0.3, 0.3)`
    let img_transform_origin = "50% 50%";
    // let profile_id = queryParams.profile_id;
    console.log({img_source, img_transform, img_transform_origin, user_token})
    console.log("------------------------------")

    if (img_source != null)
    {
    fetch(`${BASE_API_URL}/image`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({img_source, img_transform, img_transform_origin, user_token})})
    .then(response => {
            return response.text();
    })
    .then(data => {
            //alert("Add Image Successful!");
            console.log("addImage() || Data: ", data);
            console.log("------------------------------")

            getImg();
            normalizeZOrders();
    });
  }
  }

  function changeTarget(newTarget, delay = 0)
  {
    console.log("changeTarget() || IMAGE CHOSEN")
    console.log("------------------------------")

    if (newTarget == null || newTarget == "" || !newTarget.startsWith('moveable')){
      newTarget ="none"
    }
    if (moveableComponentReference.current == null)
    {
      //console.log('null')
    }
    else
    {
      //console.log('resettingstates')
      moveableComponentReference.current.resetStates(newTarget);
    }
  }

  function handleClick(e)
  {
    console.log("getImg() || Mouse down")
    console.log("------------------------------")

    setBegin(new Date());
    var pageData = getPageData();
    if (JSON.stringify(pageData) != undoStack[undoStack.length-1]){
      undoStack.push(JSON.stringify(pageData));
      console.log("UNDO STACK UPDATED");
      console.log(undoStack.length);
      console.log(undoStack);
    }
  }

  function finishClick(e)
  {
    console.log("Mouse up")
    console.log("------------------------------")

    setEnd(new Date());

    if ((end - begin) < 200) {
      changeTarget(e.target.className)
    }
    var pageData = getPageData();
    console.log("Page data");
    console.log(pageData);
    console.log(undoStack.length);
  }

  function setLocalCopyWithUndo(data)
  {
    setLocalCopy(data);

    undoStack.push(JSON.stringify(data))
  }

  function setLocalCopyFromPageData() {
    if (localCopy == null) {
      return;
    }
    for (var i = 0; i < localCopy.length; i++) {
      localCopy[i].img_transform = document.querySelector(".moveable" + localCopy[i].img_id + "").style.transform;
      localCopy[i].img_transform_origin = document.querySelector(".moveable" + localCopy[i].img_id + "").style.transformOrigin;
      localCopy[i].img_z_index = document.querySelector(".moveable" + localCopy[i].img_id + "").style.zIndex;
    }
  }

  function undo(){
    console.log(undoStack);
    changeTarget('')
    if (undoStack.length == 0){
      // Never Should be here
      return;
    }
    setImgs(false)
    console.log("Made here");
    var temp = undoStack.pop();
    if (undoStack.length == 0) {
      // This fixes a bug. Still running into a bug that you cannot undo from first operation.
      undoStack.push(temp);
    }
    console.log(temp)
    var temp = JSON.parse(temp)

    setImagesFromJSON(temp)
    setLocalCopy(temp);
    console.log(undoStack.length);
    console.log(temp);

  }

  function normalizeZOrders() {
    localCopy.sort(function(a, b) {
      return parseInt(a.img_z_index) - parseInt(b.img_z_index);
    });
    console.log(localCopy);
    for (let local in localCopy) {
      localCopy[local].img_z_index = local;
      document.querySelector(".moveable" + localCopy[local].img_id + "").style.zIndex = local;
    }
  }

  function moveToFront() {
    if (moveableComponentReference.current.state.target) {
      var max = -999;
      var numOccurences = 0;
      var indexOfTarget = -1;
      for (let local in localCopy) {
        console.log(localCopy[local])
        var num = parseInt(localCopy[local].img_z_index)
        if (num > max) {
          max = num;
          numOccurences = 1
        }
        else if (num == max) {
          numOccurences += 1;
        }
      }
      if (moveableComponentReference.current.state.target.style.zIndex != max || numOccurences > 1)
      {
        moveableComponentReference.current.state.target.style.zIndex = max+1;
        setLocalCopyFromPageData();
        normalizeZOrders();
      }
      // console.log(moveableComponentReference.current.state.target.style.zIndex)
    }
  }

  function moveToBack() {
    if (moveableComponentReference.current.state.target) {
      var min = 999;
      var numOccurences = 0;
      var indexOfTarget = -1;
      for (let local in localCopy) {
        console.log(localCopy[local])
        var num = parseInt(localCopy[local].img_z_index)
        if (num < min) {
          min = num;
          numOccurences = 1
        }
        else if (num == min) {
          numOccurences += 1;
        }
      }
      if (moveableComponentReference.current.state.target.style.zIndex != min || numOccurences > 1)
      {
        moveableComponentReference.current.state.target.style.zIndex = min-1;
        setLocalCopyFromPageData();
        normalizeZOrders();
      }
      // console.log(moveableComponentReference.current.state.target.style.zIndex)
    }
  }

  //Function gets called when a user selects an image from the image gallery on the Car_ui page
  function onImageChosen(imageUrl)
  {
    //console.log("IMG:", imageUrl)
    handleClose();
    addImage (imageUrl)
  }

  if (loaded == false) {
    return <Loading/>
  }
    return (
      <div>
        <div onMouseDown = {handleClick} onClick = {finishClick}>

            {/* <div id = "canvas"></div> */}
            <CarUIMoveable id = "carUIMoveable" ref = {moveableComponentReference} moveableTarget="target" />

            {/* BACKGROUND IMAGE */}
            <img src={BG_GENERIC} alt="Tesla console background" id="carUIBg"/>

            {/*Ternary operator */}
            {imgs ? imgs : "No images here!"}

            {/*<Button onClick = {addImage}>Add Image by URL </Button>*/}
            {/*<img id = "placedImage" className="moveable_koala3" src="https://www.treehugger.com/thmb/pzsLSvqKfyLxIvqIogiWba54u3c=/768x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__mnn__images__2019__05__koala-0f87652acc244db2ba7d2e231c868f16.jpg"/>
            <img id = "placedImage" className="moveable_koala4" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Cutest_Koala.jpg/1117px-Cutest_Koala.jpg"/>*/}

        </div>
            <Button variant="primary" id="carUI_button" onClick={handleShow}>Add an image</Button>
            <Button variant="primary" id="carUI_button" onClick = {undo}>Undo</Button>
            <Button variant="primary" id="carUI_button" onClick = {saveImgFun}>Save</Button>
            <Button variant="primary" id="carUI_button" onClick = {deleteImgFun}>Delete</Button>
            <Button variant="primary" id="carUI_button" onClick = {moveToFront}>Move to Front</Button>
            <Button variant="primary" id="carUI_button" onClick = {moveToBack}>Move to Back</Button>

            <Button variant="primary" id="carUI_button" href="/logout">Logout</Button>

            <Modal show={show} onHide={handleClose} style={{opacity:1}}>
              <Modal.Header closeButton>
                <Modal.Title>Image Gallery</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ImageSelector imageChosen = {onImageChosen}/>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
              </Modal.Footer>
            </Modal>

                  {/*<ImageSelector imageChosen = {onImageChosen}/>*/}

                  {/*<Button variant="primary" onClick={handleShow}>
                    Open Modal
                  </Button>
                  <Modal show={show} onHide={handleClose}>
                  <ImageSelector imageChosen = {onImageChosen}/>

                    <Modal.Header closeButton>
                      <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>ee
                    <ImageSelector imageChosen = {onImageChosen}/>
                    </Modal.Body>
                      <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose}>
                      Close
                      </Button>
                      <Button variant="primary" onClick={handleClose}>
                      Save Changes
                      </Button>
                      </Modal.Footer>
                   </Modal>*/}
              </div>
          );

}
export default CarUI;
//
// <Link to="/upload_img">Upload Image</Link>
// <Link to="/edit_img">Edit Existing Image</Link>
// <h2>Edit Existing Image</h2>
// <ul>
//     <li>Size, position, rotation</li>
//     <li>Delete</li>
//     <li>Replace</li>
// </ul>
