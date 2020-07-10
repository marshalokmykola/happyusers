// create FormData
var formData = new FormData();
var imgView = document.createElement("div");
var overlay = document.createElement("div");
var styleImg= document.getElementById("drop-region").getAttribute('style');
var // where files are dropped + file selector is opened
	dropRegion = document.getElementById("drop-region"),
	// where images are previewed
	imagePreviewRegion = document.getElementById("image-preview");


// open file selector when clicked on the drop region
var fakeInput = document.createElement("input");
fakeInput.type = "file";
fakeInput.accept = "image/*";
fakeInput.multiple = true;
fakeInput.name="file";
dropRegion.addEventListener('click', function() {
	fakeInput.click();
});

fakeInput.addEventListener("change", function() {
	var files = fakeInput.files;
	handleFiles(files);
});

function preventDefaultLeave(e) {
	e.preventDefault();
  	e.stopPropagation();
 document.getElementById("drop-region").setAttribute('style', styleImg + ';border-color:grey;');
}
function preventDefaultOver(e) {
	e.preventDefault();
  	e.stopPropagation();
 document.getElementById("drop-region").setAttribute('style', styleImg + ';border-color:red;');
}

dropRegion.addEventListener('dragenter', preventDefaultOver, false)
dropRegion.addEventListener('dragleave', preventDefaultLeave, false)
dropRegion.addEventListener('dragover', preventDefaultOver, false)
dropRegion.addEventListener('drop', preventDefaultLeave, false)
//Fix copy to body
document.addEventListener('dragover', preventDefaultOver, false);
document.addEventListener('dragleave', preventDefaultLeave, false);
document.addEventListener('drop', preventDefaultLeave, false);

function handleDrop(e) {
	var dt = e.dataTransfer,
		files = dt.files;
	if (files.length) {
		handleFiles(files);
		
	} else {
		// check for img
		var html = dt.getData('text/html'),
	        match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
	        url = match && match[1];
	    if (url) {
	        uploadImageFromURL(url);
	        return;
	    }

	}


	function uploadImageFromURL(url) {
		var img = new Image;
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");
        img.onload = function() {
            c.width = this.naturalWidth;     // update canvas size to match image
            c.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);       // draw in image
            c.toBlob(function(blob) {        // get content as PNG blob
            	// call our main function
                handleFiles( [blob] );

            }, "image/png");
        };
        img.onerror = function() {
            alert("Error in uploading");
        }
        img.crossOrigin = "";              // if from different origin
        img.src = url;
	}

}

dropRegion.addEventListener('drop', handleDrop, false);
function handleFiles(files) {
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])){
			previewAnduploadImage(files[i]);
		}
	}
}

function validateImage(image) {
	// check the type
	var validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf'];
	if (validTypes.indexOf( image.type ) === -1) {
		document.getElementById("message-ajax").innerHTML="Invalid File Type";
        document.getElementById("alert").style.display = 'block';  
		return false;
	}
	// check the size
	var maxSizeInBytes = 10e6; // 10MB
	if (image.size > maxSizeInBytes) {
		document.getElementById("message-ajax").innerHTML="File too large";
        document.getElementById("alert").style.display = 'block';  
		return false;
	}

	return true;

}

function previewAnduploadImage(image) {
	// container

	imgView.className = "image-view";
	imagePreviewRegion.appendChild(imgView);

	// previewing image
	var img = document.createElement("img");
	imgView.appendChild(img);

	// read the image...
	var reader = new FileReader();
	reader.onload = function(e) {
		if(image.type=='application/pdf')
			img.src="./img/pdf.svg"
		else 
		img.src = e.target.result;
	}
	reader.readAsDataURL(image);
	formData.append('filesUpload', image);
	// progress overlay
	overlay.className = "overlay";
	overlay.style.width = image.width;
	imgView.appendChild(overlay);
}

document.getElementById("send-image").addEventListener("click", send);
function send(){
var uploadLocation = '/upload';
    var ajax = new XMLHttpRequest();
    ajax.open("POST", uploadLocation, true);

    ajax.onreadystatechange = function(e) {      
           if (ajax.status === 500) 
           	document.getElementById("message-ajax").innerHTML=ajax.statusText;
            else
          	document.getElementById("message-ajax").innerHTML=ajax.response;
            document.getElementById("alert").style.display = 'block';  
			overlay.style.width='100%';          
        
    };
    ajax.upload.onprogress = function(e) {

        // change progress
        // (reduce the width of overlay)

        var perc = (e.loaded / e.total * 100) || 100,
            width = 100 - perc;
        overlay.style.width = width;
    };
   	ajax.send(formData);

formData = new FormData();
imgView.innerHTML='';
}
