let draggedElement = null;
let previewElement = null;
let lastEnteredElement = null;

function allowDrop(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function drag(ev) {
  if (ev.target.tagName.toLowerCase() === 'span' && 
      (ev.target.parentNode.classList.contains('container') || ev.target.parentNode.classList.contains('party-list'))) {
    draggedElement = ev.target;
    ev.dataTransfer.setData("Text", ev.target.id);
    ev.target.classList.add('dragging');
    
    previewElement = document.createElement('span');
    previewElement.textContent = draggedElement.textContent;
    previewElement.classList.add('preview', 'named-party');
    previewElement.id = 'preview';

    if (draggedElement.parentNode.children.length === 1) {
      draggedElement.parentNode.classList.add('empty');
    }
  } else {
    ev.preventDefault();
  }
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("Text");
  var draggedWord = document.getElementById(data);
  
  var targetContainer, beforeElement;
  if (ev.target.classList.contains('container') || ev.target.classList.contains('party-list')) {
    targetContainer = ev.target;
    beforeElement = null;
  } else {
    targetContainer = ev.target.closest('.container') || ev.target.closest('.party-list');
    beforeElement = ev.target;
  }

  if (beforeElement) {
    targetContainer.insertBefore(draggedWord, beforeElement);
  } else {
    targetContainer.appendChild(draggedWord);
  }

  draggedElement.classList.remove('dragging');
  removePreview();
  lastEnteredElement = null;

  updateEmptyState(draggedWord.parentNode);
  updateEmptyState(targetContainer);
}

function dragEnd(ev) {
  ev.target.classList.remove('dragging');
  removePreview();
  lastEnteredElement = null;

  updateEmptyState(ev.target.parentNode);
}

function updateEmptyState(container) {
  if (container.children.length === 0) {
    container.classList.add('empty');
  } else {
    container.classList.remove('empty');
  }
}

function dragEnter(ev) {
  ev.preventDefault();
  lastEnteredElement = ev.target;
  if (draggedElement && ev.target !== previewElement) {
    updatePreview(ev);
  }
}

function dragLeave(ev) {
  if (ev.target === previewElement) {
    let nextTarget = ev.target.nextElementSibling;
    while (nextTarget && nextTarget === previewElement) {
      nextTarget = nextTarget.nextElementSibling;
    }
    
    if (!nextTarget) {
      nextTarget = ev.target.parentElement;
    }
    
    updatePreview({ target: nextTarget });
  }
}

function updatePreview(ev) {
  if (ev.target.classList.contains('container') || ev.target.classList.contains('party-list')) {
    const lastWord = ev.target.lastElementChild;
    if (lastWord === draggedElement) {
      removePreview();
      return;
    }
  } else if (ev.target.tagName === 'SPAN') {
    if (draggedElement.nextElementSibling === ev.target) {
      removePreview();
      return;
    }
  }

  removePreview();
  
  if (ev.target.classList.contains('container') || ev.target.classList.contains('party-list')) {
    ev.target.appendChild(previewElement);
  } else if (ev.target !== draggedElement) {
    let container = ev.target.closest('.container') || ev.target.closest('.party-list');
    container.insertBefore(previewElement, ev.target);
  }
}

function removePreview() {
  if (previewElement && previewElement.parentNode) {
    previewElement.parentNode.removeChild(previewElement);
  }
}

function handleSelection(event) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    if (startContainer !== endContainer || 
        !startContainer.parentElement.matches('span') || 
        !endContainer.parentElement.matches('span')) {
      selection.removeAllRanges();
    } else {
      const span = startContainer.parentElement;
      range.setStart(span.firstChild, 0);
      range.setEnd(span.firstChild, span.textContent.length);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

window.onload = function() {
  var spans = document.getElementsByTagName('span');
  for (var i = 0; i < spans.length; i++) {
    spans[i].addEventListener('dragstart', drag);
    spans[i].addEventListener('dragend', dragEnd);
    spans[i].addEventListener('dragenter', dragEnter);
    spans[i].addEventListener('dragleave', dragLeave);
  }
  
  var containers = document.getElementsByClassName('container');
  for (var i = 0; i < containers.length; i++) {
    containers[i].addEventListener('dragover', allowDrop);
    containers[i].addEventListener('dragenter', dragEnter);
    containers[i].addEventListener('dragleave', dragLeave);
    containers[i].addEventListener('drop', drop);
    updateEmptyState(containers[i]);
  }

  var partyLists = document.getElementsByClassName('party-list');
  for (var i = 0; i < partyLists.length; i++) {
    partyLists[i].addEventListener('dragover', allowDrop);
    partyLists[i].addEventListener('dragenter', dragEnter);
    partyLists[i].addEventListener('dragleave', dragLeave);
    partyLists[i].addEventListener('drop', drop);
    updateEmptyState(partyLists[i]);
  }

  document.addEventListener('selectionchange', handleSelection);
}