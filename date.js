

function needate(){
    var date = new Date()
    var options = {
        weekday:"long",
        month:"long",
        day:"numeric"
    };

    var day = date.toLocaleDateString("en-US",options);
    return day;
}

module.exports.needate = needate;