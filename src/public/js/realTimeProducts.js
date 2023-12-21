const realTimeProductsSocket = io()
const productList = document.getElementById('productsList');

realTimeProductsSocket.emit("message", "Cliente (realTimeProducts)")
realTimeProductsSocket.on("realTimeProducts", ({ products }) => {
  if (productList) {
    productList.innerHTML = '';
    products.forEach(product => {
      const { thumbnail, title, description, price, code, stock, _id } = product
      productList.innerHTML += `
    <div class="col-md-6 col-lg-4" id="${_id}">
      <div class="card mt-4 bg-light" style="width: 100%;">
        <div
          class="img-container"
          style="width: 150px; height: 150px; overflow: hidden; margin: 0 auto;"
        >
          <img
            src="${thumbnail}"
            class="card-img-top"
            alt="${title}"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </div>
        <div class="card-body" style="height: 250px;">
          <h2 class="card-title text-info">${title}</h2>
          <p
            class="card-text description"
            style="font-weight: bold; font-size: 1.1em;"
          >${description}</p>
          <p class="card-text">Precio: $ ${price}</p>
          <p class="card-text">Código: ${code}</p>
          <p class="card-text">Stock: ${stock}</p>
        </div>
        <div class="card-footer text-center">
          <a href="/realTimeProducts/${_id}" title="Ver Mas" class="btn btn-info"><i class="fa-regular fa-circle-info"></i></a>
          <button title="Editar" onclick="botonEditar('${_id}')" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editModal" data-bs-title="${title}" data-bs-stock="${stock}" data-bs-code="${code}" data-bs-description="${description}" data-bs-price="${price}" data-bs-thumbnail="${thumbnail}"><i class="fa-regular fa-pen-to-square"></i></button>
          <button title="Eliminar" class="btn btn-danger" onclick="deleteProduct('${_id}')"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
    </div>
    `;
    });
  } else {
    console.log("Elemento 'product-list' no encontrado en el DOM");
  }
})

document.getElementById('addProductForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const thumbnail = document.getElementById('thumbnail').value;
  const code = document.getElementById('code').value;
  const stock = document.getElementById('stock').value;

  realTimeProductsSocket.emit('addProduct', {
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  });

  this.reset();
});

let editModal = document.getElementById('editModal')
let editForm = document.getElementById('editForm')
function botonEditar(pid) {
  function onModalShown(event) {
    let button = event.relatedTarget

    let productId = pid
    let title = button.getAttribute('data-bs-title')
    let description = button.getAttribute('data-bs-description')
    let price = button.getAttribute('data-bs-price')
    let thumbnail = button.getAttribute('data-bs-thumbnail')
    let code = button.getAttribute('data-bs-code')
    let stock = button.getAttribute('data-bs-stock')

    editModal.querySelector('.modal-body #productId').value = productId
    editModal.querySelector('.modal-body #editedTitle').value = title
    editModal.querySelector('.modal-body #editedTitle').focus()
    editModal.querySelector('.modal-body #editedDescription').value = description
    editModal.querySelector('.modal-body #editedPrice').value = price
    editModal.querySelector('.modal-body #editedThumbnail').value = thumbnail
    editModal.querySelector('.modal-body #editedCode').value = code
    editModal.querySelector('.modal-body #editedStock').value = stock;
    editModal.removeEventListener('shown.bs.modal', onModalShown);
  }
  editModal.addEventListener('shown.bs.modal', onModalShown);
}
function saveChanges() {
  const productId = document.getElementById('productId').value;
  const title = document.getElementById('editedTitle').value;
  const description = document.getElementById('editedDescription').value;
  const price = document.getElementById('editedPrice').value;
  const thumbnail = document.getElementById('editedThumbnail').value;
  const code = document.getElementById('editedCode').value;
  const stock = document.getElementById('editedStock').value;

  const editedProduct = {
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  };

  $('#editModal').modal('hide')

  realTimeProductsSocket.emit('editProduct', {
    productId,
    editedProduct
  });
}

editModal.addEventListener('hide.bs.modal', event => {
  editForm.reset()
})

function deleteProduct(productId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esto',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminarlo'
  }).then((result) => {
    if (result.isConfirmed) {
      realTimeProductsSocket.emit('deleteProduct', productId);
    }
  });
}
