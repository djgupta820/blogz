// class extras {
//     // Creating function to get date and time
//     getCurrentDateAndTime() {
//         const date = new Date()
//         let d = date.getDay()
//         let m = date.getMonth()
//         let h = date.getHours()
//         let mint = date.getMinutes()
//         let s = date.getSeconds()

//         if (d <= 9) {
//             d = '0' + d
//         }
//         if (m <= 9) {
//             m = '0' + m
//         }
//         if (h <= 9) {
//             h = '0' + h
//         }
//         if (mint <= 9) {
//             mint = '0' + mint
//         }
//         if (s <= 9) {
//             s = '0' + s
//         }
//         let dt = d + '-' + m + '-' + date.getFullYear() + ' ' + h + ':' + mint + ':' + s
//         return dt
//     }
// }

exports.getCurrentDateAndTime = function() {
    const date = new Date()
    let d = date.getDay()
    let m = date.getMonth()
    let h = date.getHours()
    let mint = date.getMinutes()
    let s = date.getSeconds()

    if (d <= 9) {
        d = '0' + d
    }
    if (m <= 9) {
        m = '0' + m
    }
    if (h <= 9) {
        h = '0' + h
    }
    if (mint <= 9) {
        mint = '0' + mint
    }
    if (s <= 9) {
        s = '0' + s
    }
    let dt = d + '-' + m + '-' + date.getFullYear() + ' ' + h + ':' + mint + ':' + s
    return dt
}