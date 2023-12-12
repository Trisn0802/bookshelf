document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function cekCheckBox() {
  document.getElementById("inputBookIsComplete").checked = true;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// Menambahkan Buku baru
function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value.trim();
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  let bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  if (books && books.length > 0) {
    alert("Anda berhasil menambahkan buku baru !!");
  } else {
    alert("Gagal menambahkan buku mohon cek internet anda !!");
  }
}

// Menghapus Buku
function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget !== -1) {
    // tampilkan konfirmasi kepada pengguna
    let answer = confirm("Apakah anda yakin ingin menghapus buku ini?");
    // jika pengguna mengklik OK, hapus buku
    if (answer) {
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      // periksa apakah buku masih memiliki elemen
      if (books.length > 0) {
        // tampilkan pesan sukses
        alert("Anda berhasil menghapus buku !!");
      } else {
        // tampilkan pesan gagal
        alert("Anda gagal menghapus buku !!");
      }
    }
    // jika pengguna mengklik Cancel, maka tidak lakukan apa-apa
  }
}

// Mengembalikan buku ke Rak Belum selesai dibaca
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Selesaikan baca buku
function addBookToCompleted(todoId) {
  const bookTarget = findBook(todoId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Menyimpan data buku ke Local Storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Mencari judul buku
function searchBook() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.trim()
    .toLowerCase();

  const searchResults = books.filter((book) =>
    book.bookTitle.toLowerCase().includes(searchTitle)
  );

  displaySearchResults(searchResults);
}

// Menampilkan hasil pencarian judul buku
function displaySearchResults(results) {
  const uncompletedReadingBook = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedReadingBook = document.getElementById("completeBookshelfList");
  const searchResultMessage = document.getElementById("searchResultMessage");

  uncompletedReadingBook.innerHTML = "";
  completedReadingBook.innerHTML = "";

  if (results.length === 0) {
    // Jika hasil pencarian kosong, tampilkan pesan
    searchResultMessage.style.display = "block";
    searchResultMessage.textContent = "Judul buku tidak ditemukan";
    searchResultMessage.style.color = "red";
  } else {
    // Jika ada hasil pencarian, tampilkan hasilnya
    searchResultMessage.style.display = "none";
    for (const bookItem of results) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isCompleted) {
        uncompletedReadingBook.append(bookElement);
      } else {
        completedReadingBook.append(bookElement);
      }
    }
  }
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, bookTitle, bookAuthor, bookYear, isCompleted) {
  return {
    id,
    bookTitle,
    bookAuthor,
    bookYear,
    isCompleted,
  };
}

const books = [];
const RENDER_EVENT = "render-book";

// Membuat tampilan data Buku
function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.bookTitle;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.bookAuthor;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.bookYear;

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const actionSection = document.createElement("div");
    actionSection.classList.add("action");

    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    // Membuat teks button
    undoButton.textContent = "Belum selesai di Baca";

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    // Membuat teks button
    trashButton.textContent = "Hapus buku";

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(actionSection);
    actionSection.append(undoButton, trashButton);
  } else {
    const actionSection = document.createElement("div");
    actionSection.classList.add("action");

    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    // Membuat teks button
    checkButton.textContent = "Selesai dibaca";

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    // Membuat teks button
    trashButton.textContent = "Hapus buku";

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(actionSection);
    actionSection.append(checkButton, trashButton);
  }

  return container;
}

// Mengambil id dan menampilkan data buku
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedReadingBook = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedReadingBook.innerHTML = "";

  const completedReadingBook = document.getElementById("completeBookshelfList");
  completedReadingBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) uncompletedReadingBook.append(bookElement);
    else completedReadingBook.append(bookElement);
  }
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
