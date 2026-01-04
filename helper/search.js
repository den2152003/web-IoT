module.exports = (query) => {
    let objectSearch = {
        keyword: "",
    };

    if(query.keyword)
    {
        objectSearch.keyword = query.keyword;
        const reg = new RegExp(objectSearch.keyword, "i");
        objectSearch.reg = reg;
    }
    
    return objectSearch;
}