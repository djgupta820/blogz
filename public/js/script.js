const openMenu = document.querySelector('#openMenu')
const closeMenu = document.querySelector('#closeMenu')
const links = document.querySelector('#links')
const p = document.querySelector('#srch')
const fclose = document.querySelector('#fclose')

openMenu.addEventListener('click', ()=>{
    links.style.right = 0;
})

closeMenu.addEventListener('click', ()=>{
    links.style.right = '-60%'
})

p.addEventListener('click', ()=>{
    search.style.display = 'flex'
})

fclose.addEventListener('click', ()=>{
    search.style.display = 'none'
})
