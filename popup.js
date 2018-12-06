window.onload = function(){
    var KeepInfo = {};
    var storage = localStorage.getItem("keeplist");
    if (storage == null){
        KeepInfo.lastId = -1;
        KeepInfo.notes = [];
        var keepInfoJson = JSON.stringify(KeepInfo);
        localStorage.setItem("keeplist", keepInfoJson);
    }
    loadThisNote(addThisNote);
    var saveBut = document.getElementById("createnote").getElementsByClassName("but")[0];
    saveBut.onclick = saveThisNote;
    loadAllNotes();
};

function loadThisNote(callback){
    var KeepInfo = JSON.parse(localStorage.getItem("keeplist"));
    var id = parseInt(KeepInfo.lastId, 10) + 1;
    var thisNote = {};
    thisNote.id = id;
    thisNote.name = "New set";
    thisNote.tabs = [];
    chrome.windows.getAll({populate:true}, loadTabs);
    function loadTabs(winData){
        for (var i in winData) {
            if (winData[i].focused === true) {
                var winTabs = winData[i].tabs;
                var totTabs = winTabs.length;
                for (var j=0; j<totTabs;j++) {
                    var tab = {};
                    tab.title = winTabs[j].title;
                    tab.favIconUrl = winTabs[j].favIconUrl;
                    tab.url = winTabs[j].url;
                    thisNote.tabs.push(tab);
                }
            }
        }
        window.sessionStorage.removeItem("thisNote");
        window.sessionStorage.setItem("thisNote", JSON.stringify(thisNote));
        if(callback){
            callback(thisNote);
        }
        
    }
    
}

function addThisNote(thisNote){
    var thisNoteDiv = document.getElementById("createnote");
    var tabsDiv = thisNoteDiv.getElementsByClassName("tabsList")[0];
    for(var i in thisNote.tabs){
        var tab = document.createElement('img');
        tab.src = thisNote.tabs[i].favIconUrl;
        tab.className = "tabfavicon";
        tab.title = thisNote.tabs[i].title;
        tabsDiv.append(tab);
    }
}

function saveThisNote(){
    var thisNote = JSON.parse(window.sessionStorage.getItem("thisNote"));
    var KeepInfo = JSON.parse(localStorage.getItem("keeplist"));
    var thisNoteDiv = document.getElementById("createnote");
    var noteName = thisNoteDiv.getElementsByClassName("noteNameInput")[0];
    if (noteName.value !== ""){
        thisNote.name = noteName.value;
    }else{
        thisNote.name = "New set";
    }
    if(KeepInfo.notes == null){
        KeepInfo.notes = [];
    }
    KeepInfo.lastId = thisNote.id;
    KeepInfo.notes.push(thisNote);
    localStorage.removeItem("keeplist");
    localStorage.setItem("keeplist", JSON.stringify(KeepInfo));
    
    createNoteDiv(thisNote);
}

function createNoteDiv(thisNote){
    var note = document.createElement('div');
    note.className = "note";
    note.id = thisNote.id;
    var noteName = document.createElement('div');
    noteName.className = "noteName";
    var noteNameStatic = document.createElement('div');
    noteNameStatic.className = "noteNameStatic";
    noteNameStatic.textContent = thisNote.name;
    noteNameStatic.onclick = open;
    var but = document.createElement('div');
    but.className = "but";
    but.textContent = "Delete";
    but.onclick = deleteThisNote;
    var tabsList = document.createElement('div');
    tabsList.className = "tabsList";
    for(var i in thisNote.tabs){
        var tab = document.createElement('img');
        tab.src = thisNote.tabs[i].favIconUrl;
        tab.className = "tabfavicon";
        tab.title = thisNote.tabs[i].title;
        tabsList.append(tab);
    }
    noteName.append(noteNameStatic);
    noteName.append(but);
    note.append(noteName);
    note.append(tabsList);
    var splitDiv = document.createElement('div');
    splitDiv.className = "split";
    note.append(splitDiv);
    var notesList = document.getElementById("notesList");
    notesList.insertBefore(note, notesList.firstChild);
}

function deleteThisNote(e){
    var noteDiv = e.target.parentElement.parentElement;
    var id = noteDiv.id;
    noteDiv.parentElement.removeChild(noteDiv);
    var KeepInfo = JSON.parse(localStorage.getItem("keeplist"));
    var newNotesList = [];
    for(var i in KeepInfo.notes){
        if(KeepInfo.notes[i].id != id){
            newNotesList.push(KeepInfo.notes[i]);
        }
    }
    KeepInfo.notes = newNotesList;
    localStorage.removeItem("keeplist");
    localStorage.setItem("keeplist", JSON.stringify(KeepInfo));
}

function loadAllNotes(){
    var KeepInfo = JSON.parse(localStorage.getItem("keeplist"));
    for(var i in KeepInfo.notes){
        createNoteDiv(KeepInfo.notes[i]);
    }
}

function open(e){
    var noteDiv = e.target.parentElement.parentElement;
    var id = noteDiv.id;
    var KeepInfo = JSON.parse(localStorage.getItem("keeplist"));
    for(var i in KeepInfo.notes){
        if(KeepInfo.notes[i].id == id){
            var thisNote = KeepInfo.notes[i];
        }
    }
    openAllTabs(thisNote);
}

function openAllTabs(thisNote){
    for(var i in thisNote.tabs){
        var obj = {};
        obj.url = thisNote.tabs[i].url;
        chrome.tabs.create(obj);
    }
}