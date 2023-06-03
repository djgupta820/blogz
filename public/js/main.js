const blog = document.querySelector('#blog')

function createMessage(message, parentElemet, messageType){
    const div = document.createElement('div')
    div.className = 'message-' + messageType
    const text = document.createTextNode(message)
    div.append(text)
    parentElemet.parentNode.insertBefore(div, parentElemet)
    setTimeout(()=>{
        parentElemet.parentNode.removeChild(div)
    }, 5000)
}

blog.addEventListener('submit', (e)=>{
    e.preventDefault()

    const title = blog['title'].value
    const category = blog['category'].value
    const text = blog['text'].value

    if(title === ''){
        createMessage("Title is required to post the blog.", blog, 'danger')
    }
    else if(category === ''){
        createMessage("Category is required to post the blog.", blog, 'danger')
    }
    else if(text === ''){
        createMessage("Blog data is required to post the blog.", blog, 'danger')
    }
    else{
        blog.submit()
    }
})
console.log(blog)