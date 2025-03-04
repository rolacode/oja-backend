const Category = require('../../models/Category');

// @desc Create Category
// @route POST /v1/categories
// @access Private
const createCategoryHandler = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Name must be a valid string' });
        }

        // ✅ Correct Mongoose syntax
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // ✅ Use create() instead of insertMany()
        const category = await Category.create({ name });

        return res.status(201).json({
            message: 'Category created successfully',
            category,
        });

    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// @desc Retrieve Categories
// @route GET /v1/categories
// @access Public
const getCategoriesHandler = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// @desc Retrieve Category
// @route GET /v1/categories/:id
// @access Public
const getCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({
                message: 'Id must be a string',
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found',
            });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// @desc Update Category
// @route PUT /v1/categories/:id
// @access Private
const updateCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (typeof id !== 'string') {
            return res.status(400).json({
                message: 'Id must be a string',
            });
        }

        if (typeof name !== 'string') {
            return res.status(400).json({
                message: 'Name must be a string',
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found',
            });
        }
        //update category
        category.name = name;
        await Category.updateOne({name});
        return res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// @desc Delete Category
// @route DELETE /v1/categories/:id
// @access Private
const deleteCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return res.status(400).json({
                message: 'Id must be a string',
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found',
            });
        }

        await category.deleteOne();
        res.status(204).json({
            message: 'category is successfully deleted', 
            category,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createCategoryHandler,
    getCategoriesHandler,
    getCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
};