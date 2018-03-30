var Devboard = function() {
  var devboard = document.querySelector('#devboard');
  if (devboard === null) return null;
  var removedElements = document.querySelectorAll('.removed-content');
  var addedElements = document.querySelectorAll('.added-content');
  this.removedContentIsDisplayed = false;
  this.addedContentIsDisplayed = false;
  this.toggleRemovedContent = function() {
    if (this.removedContentIsDisplayed) {
      for (i = 0; i < removedElements.length; i++) {
        removedElements[i].style.display = 'none';
      }
      this.removedContentIsDisplayed = false;
    } else {
      for (i = 0; i < removedElements.length; i++) {
        removedElements[i].style.display = 'initial';
      }
      this.removedContentIsDisplayed = true;
    }
  };
  this.toggleAddedContent = function() {
    if (this.addedContentIsDisplayed) {
      for (i = 0; i < addedElements.length; i++) {
        addedElements[i].style.display = 'none';
        addedElements[i].style.border = '1px solid LawnGreen';
      }
      this.addedContentIsDisplayed = false;
    } else {
      for (i = 0; i < addedElements.length; i++) {
        addedElements[i].style.display = 'initial';
        addedElements[i].style.border = '1px solid red';
      }
      this.addedContentIsDisplayed = true;
    }
  };
  var toggleRemovedContent = document.createElement('button');
  var toggleRemovedContentText = document.createTextNode('show removed content');
  toggleRemovedContent.appendChild(toggleRemovedContentText);
  devboard.appendChild(toggleRemovedContent);
  toggleRemovedContent.onclick = this.toggleRemovedContent;
  var toggleAddedContent = document.createElement('button');
  var toggleAddedContentText = document.createTextNode('show added content');
  toggleAddedContent.appendChild(toggleAddedContentText);
  devboard.appendChild(toggleAddedContent);
  toggleAddedContent.onclick = this.toggleAddedContent;
  this.toggleRemovedElements();
  this.toggleAddedElements();
};

var devboard = new Devboard();
