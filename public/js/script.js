const openMenu = document.querySelector('#openMenu')
const closeMenu = document.querySelector('#closeMenu')
const links = document.querySelector('#links')

openMenu.addEventListener('click', ()=>{
    links.style.right = 0;
})

closeMenu.addEventListener('click', ()=>{
    links.style.right = '-60%';
})