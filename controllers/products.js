const Product = require('../models/product')


const getAllProductStatic = async (req,res) =>{
    const search = 'first'
    const products = await Product.find({price: {$gt:30}}).sort('name').select('price name').limit(10).skip(2)
    res.status(200).json({msg:products, nbHits : products.length})
}

const getAllProduct = async (req,res) =>{
    const {featured, company, name,sort,fields,numericFilters} = req.query
    const queryObject ={}
    if(featured){
        queryObject.featured = featured === 'true'? true: false
    }
    if(company){
        queryObject.company = company
    }
    if(name){
        queryObject.name = { $regex: name, $options: 'i'}
    }
    if (numericFilters) {
        console.log(numericFilters)
        const operatorMap ={
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(
            regEx,(match)=>`-${operatorMap[match]}-`
            )
        console.log(filters)
        const options = ['price','rating'];
        filters = filters.split(',').forEach((item)=>{
            const[field,operator,value] = item.split('-')
        console.log(field,operator,value)
            if (options.includes(field)) {
                queryObject[field] ={[operator]: Number(value)}
            }
        })
    }
    console.log(queryObject)
    let result = Product.find(queryObject)
    //sort
    if(sort){
        console.log(sort)
        const sortList = sort.split(',').join(' ');
        console.log(sortList)
        result = result.sort(sortList)
    }else{
        result = result.sort('createdAt')
    }
    //select fields
    if(fields){
        console.log(fields)
        const fieldsList = fields.split(',').join(' ');
        console.log(fieldsList)
        result = result.select(fieldsList)
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;
    
    result = result.skip(skip).limit(limit)

    const products = await result
    res.status(200).json({msg:products, nbHits : products.length})
}

module.exports = {
    getAllProduct,
    getAllProductStatic,
}