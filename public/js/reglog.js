const login = document.querySelector('#login')
const register = document.querySelector('#register')

function createMessage(data, parentElemet, messageType){
    const div = document.createElement('div')
    div.className = 'message-' + messageType
    const text = document.createTextNode(data)
    div.append(text)
    parentElemet.parentNode.insertBefore(div, parentElemet)
    setTimeout(()=>{
        parentElemet.parentNode.removeChild(div)
    }, 5000)
}

if(login){
    login.addEventListener('submit', (e)=>{
        e.preventDefault()
        const username = login['username'].value
        const password = login['password'].value
        if(username === ''){
            createMessage("Please input username!", login, 'danger')
        }
        else if(password === ''){
            createMessage("Please input password!", login, 'danger')
        }
        else{
            login.submit()
        }
    })
}

if(register){
    register.addEventListener('submit', (e)=>{
        e.preventDefault()
        const name = register['name'].value
        const username = register['username'].value
        const email = register['email'].value
        const password1 = register['password1'].value
        const password2 = register['password2'].value

        if(name === ''){
            createMessage("Please input name!", register, 'danger')
        }
        else if(username === ''){
            createMessage("Please input username that you want to use at the time of login!", register, 'danger')
        }
        else if(email === ''){
            createMessage("Please input your email address!", register, 'danger')
        }
        else if(password1 === ''){
            createMessage("Please input password!", register, 'danger')
        }
        else if(password2 === ''){
            createMessage("Please confirm your password!", register, 'danger')
        }
        else{
            if(password1 !== password2){
                createMessage("Password and Confirm Password did not matched! Please try again", register, 'danger')
            }
            else{
                register.submit()
            }
        }
    })
}


