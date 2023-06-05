const blog = document.querySelector('#blog')
const cform = document.querySelector('#cform')

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

if(blog){
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
}

if(cform){
    cform.addEventListener('submit', (e)=>{
        e.preventDefault()
        const p1 = cform['password1']
        const p2 = cform['password2']
        console.log(p1, p2)
        if(p1.lenght == 0){
            createMessage('please enter new password ', cform, 'danger')
        }
        if(p2.lenght == 0){
            createMessage('please enter confirm password ', cform, 'danger')
        }
        if(p1 !== p2){
            createMessage('new password and confirm password did not match!', cform, 'danger')
        }else{
            cform.submit()
        }
    })
}