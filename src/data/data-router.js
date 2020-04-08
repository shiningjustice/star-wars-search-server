const express = require('express');
const jsonParser = express.json();

const { sanitizeSavedData } = require('../helpers');
const SavedDataService = require('./saved-data-service');

const dataRouter = express.Router();
const { isValidUser, requireAuth } = require('../middleware/jwt-auth');
const { getAllInAllCategories, getAllOfCategory, getByIdInCategory, searchInCategory} = require('../utils/swapi-util');
const savedFields = ['favorited', 'notes'];

/*****************************************************************
 * GET ALL SAVED DATA
******************************************************************/
dataRouter
  .route('/')
  .get(isValidUser, async (req, res, next) => {
    try {
      const allCategoriesData = await getAllInAllCategories();
      
      // Only allow authenticated users to access `SavedDataService` functions
      if (req.user) {

        // Get saved fields for each of the categories of data
        await Promise.all(
          allCategoriesData.map(async (categoryData, index) => {
            const category = Object.keys(categoryData);
            const savedData = await SavedDataService.getCategorysSavedData(
              req.app.get('db'), 
              `saved_${category}`,
              req.user.id
            );
        
            const swapiResultsArray = allCategoriesData[index][category].results;
            
            // Add the saved data to the `allCategoriesData` array
            savedData.forEach(sD => { 
              // sanitize response
              sD = sanitizeSavedData(sD);
  
              // Find where it's entity is in the `allCategoriesData` (SWAPI) array
              const searchUrl = `https://swapi.co/api/${category}/${sD.id}/`;
              const resultIndex = swapiResultsArray.findIndex(entity => entity.url === searchUrl);
  
              // Add saved data to array
              savedFields.forEach(field => 
                allCategoriesData[index][category].results[resultIndex][field] = sD[field]
              )
            }); 
          })
        );
      }

      return res.status(200).json(allCategoriesData); //result is an array of objects
    } catch (error) {
      next(error);
    };
  })


/*****************************************************************
 * FOR ALL RESULTS IN CATEGORY (GET, POST)
******************************************************************/
dataRouter
  .route('/:category')
  .get(isValidUser, async (req, res, next) => {
    const { category } = req.params;
    try {
      const allOfCategory = await getAllOfCategory(category);
      
      // Only allow authenticated users to access `SavedDataService` functions
      if (req.user) {
        const savedData = await SavedDataService.getCategorysSavedData(
          req.app.get('db'),
          `saved_${category}`,
          req.user.id
        );
  
        savedData.forEach(sD => {
          // sanitize data
          sD = sanitizeSavedData(sD);
  
          // Find where it's entity is in the `allOfCategory` (SWAPI) array
          const searchUrl = `https://swapi.co/api/${category}/${sD.id}/`;
          const resultIndex = allOfCategory.results.findIndex(entity => entity.url === searchUrl);
  
          // Add saved data to array
          savedFields.forEach(field => 
            allOfCategory.results[resultIndex][field] = sD[field]
          );
        });
      }

      return res.status(200).json(allOfCategory); //result is an object
    } catch (error) {
      next(error);
    };
  })
  .post(requireAuth, jsonParser, async (req, res, next) => {
    const { favorited, notes, id } = req.body;
    const dataToSave = { id, user_id: req.user.id, favorited, notes };
    const tableName = 'saved_' + req.params.category;
    let counter = 0;

    // Return 400 if `id` is invalid
    if (!id || Number.isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid data id'});
    }

    //Post body should contain at least either `favorited` or `notes`
    [favorited, notes].forEach(field => field && counter++);
    if (counter === 0) {
      return res.status(400).json({ error: 'Missing data in request body' });
    };

    try {
      const savedData = await SavedDataService.saveNewData(
        req.app.get('db'),
        tableName,
        dataToSave
      );
      return res.status(201).json(sanitizeSavedData(savedData));
    } catch (error) {
      next(error);
    }; 
  });


/*****************************************************************
 * FOR SPECIFIC RESULT IN CATEGORY (GET, PATCH, DELETE)
******************************************************************/
dataRouter
  .route('/:category/:id')
  .get(isValidUser, async (req, res, next) => {
    const { category, id } = req.params;
    const tableName = `saved_${category}`;

    // Return 400 if `id` is invalid
    if (!id || Number.isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid data id'});
    }
    
    try {
      const entity = await getByIdInCategory(id, category);
      
      // Only allow authenticated users to access `SavedDataService` functions
      if (req.user) {
        let savedData = await SavedDataService.getItemsSavedData(
          req.app.get('db'),
          tableName,
          req.user.id,
          id
        );
  
        // sanitize data
        savedData = sanitizeSavedData(savedData);
  
        // Add saved data to entity
        savedFields.forEach(field => entity[field] = savedData[field]);
      }

      return res.status(200).json(entity); //returns an object of entity
    } catch(error) {
      next(error);
    }
  })
  .patch(requireAuth, jsonParser, async (req, res, next) => {
    const { category, id } = req.params;
    const dataToSave = req.body;
    const fieldsToUpdate = {};

    // Return 400 if `id` is invalid
    if (!id || Number.isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid data id'});
    }

    savedFields.forEach(field => {
      fieldsToUpdate[field] = dataToSave[field];
    });

    try {
      const savedData = await SavedDataService.updateSavedData(
        req.app.get('db'),
        `saved_${category}`,
        req.user.id,
        req.body.id,
        fieldsToUpdate
      );

      return res.status(200).json(sanitizeSavedData(savedData)); //returns an object of entity
    } catch(error) {
      next(error);
    }
  })
  .delete(requireAuth, async (req, res, next) => {
    const { category, id } = req.params;
    const tableName = 'saved_' + category;

    if (!id) {
      return res.status(400).json({ error: 'Invalid data id' });
    };

    try {
      await SavedDataService.deleteSavedData(
        req.app.get('db'),
        tableName,
        req.user.id,
        id
      );
      
      return res.status(204).end();
    } catch(error) {
      next(error);
    }
  })

module.exports = dataRouter;