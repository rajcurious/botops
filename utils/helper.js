
const getOne = (list) => {
    if(list){
        if(list.length > 0){
            return list[0];
        } 
        return null;
    }
    return null;
}

module.exports = {getOne};

