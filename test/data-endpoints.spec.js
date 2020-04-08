const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Data Endpoints', function () {
	let db;
	const testUsers = helpers.usersArray;
	const testUser = testUsers[0];
  const { createSavedSeeds, categories } = helpers;
  const endpointPath = '/api/data';
  const savedFields = ['favorited', 'notes'];

	before('make knex instance', () => {
		db = helpers.makeKnexInstance();
		app.set('db', db);
  });
  
  beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
	after('disconnect from db', () => db.destroy());
	before('cleanup', () => helpers.cleanTables(db));
	afterEach('cleanup', () => helpers.cleanTables(db));

	/*****************************************************************
    GET /api/saved

    Get all saved items
  ******************************************************************/
	describe(`GET ${endpointPath} (all saved items)`, () => {
		beforeEach('insert saved data for all categories', () => {
			categories.forEach((category) => {
				helpers.seedCategory(db, category, createSavedSeeds(category)[0]);
			});
		});

		it(`responds 200 and array of objects of each category`, () => {
			this.timeout(2000);
			return supertest(app)
				.get(endpointPath)
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.expect(200)
				.then((res) => {
					categories.forEach((category) => {
            const results = res.body; //Array of objects
            const catIndex = results.findIndex(catObj => Object.keys(catObj).includes(category));

            //Each category should be a key in the object
            expect(Object.keys(results[catIndex]).includes(category)).to.be.true;
            
            const result = res.body[catIndex][category].results; // array of entities
            const savedSeed = createSavedSeeds(category)[0];

            //Each category should have the correct notes for the inputted seed
						urlPerSavedId = `https://swapi.co/api/${category}/${savedSeed.id}/`;
						const index = result.findIndex(
							(entity) => entity.url === urlPerSavedId
            );            
						savedFields.forEach((field) => {
							expect(result[index][field]).to.be.eql(
								savedSeed[field]
							);
						});
					});
				});
		});
	});

	/*****************************************************************
    GET /api/saved/:category
    
    Get all saved items from a particular category
  ******************************************************************/
	describe.only(`GET ${endpointPath}/:category (all saved items from particular category)`, () => {
    categories.map((category) => {
      beforeEach(`insert saved data for category ${category}`, () => {
        helpers.seedCategory(db, category, createSavedSeeds(category));
      });

      it.only(`responds 200 and array of objects of each category if not logged in`, () => {
        return supertest(app)
        .get(`${endpointPath}/${category}`)
        .expect(200)
      });
      
			it(`responds 200 and array of objects of each category`, () => {
        this.timeout(1000);

        return supertest(app)
          .get(`${endpointPath}/${category}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then((res) => {
            const result = res.body.results;

            const savedSeed = createSavedSeeds(category)[0];

            //Each category should have the correct notes for the inputted seed
						urlPerSavedId = `https://swapi.co/api/${category}/${savedSeed.id}/`;
						const index = result.findIndex(
              (entity) => entity.url === urlPerSavedId
            );

						savedFields.forEach(field => {
							expect(result[index][field]).to.be.eql(
								savedSeed[field]
							);
            });
          })
			});
		});
	});

	/*****************************************************************
    POST /api/saved/:category

    Post new item to be saved to be saved to a 
    particular category
  ******************************************************************/
	describe(`POST ${endpointPath}/:category`, () => {
    categories.forEach(category => {
      const newSeed = helpers.createSavedSeeds(category)[1];

      it(`responds 400 and message when invalid id`, () => {
        const seedWithInvalidId = {};
        Object.keys(newSeed).forEach(key => 
          key === 'id' ? (
            seedWithInvalidId[key] = 'iAmInvalid'
          ) : (
            seedWithInvalidId[key] = newSeed[key]
          )
        )

        return supertest(app)
          .post(`${endpointPath}/${category}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(seedWithInvalidId)
          .expect(400, { error: 'Invalid data id' })
      });

      it(`responds 201 and updated entity data`, () => {
        return supertest(app)
          .post(`${endpointPath}/${category}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newSeed)
          .expect(201)
          .then(res => {
            savedFields.forEach(field => 
              expect(res.body[field]).to.be.eql(newSeed[field])
            )
          })
      })
    })
	});

	/*****************************************************************
    GET /api/saved/:category/:id

    Get particular saved item
  ******************************************************************/
	describe(`GET ${endpointPath}/:category/:id`, () => {
    categories.forEach(category => {
      const savedItem = createSavedSeeds(category)[0];

      beforeEach('seed category', () => helpers.seedCategory(db, category, [savedItem]));
      
      it(`responds 400 and message when invalid id`, () => {
        return supertest(app)
          .get(`${endpointPath}/${category}/iAmInvalid`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(savedItem)
          .expect(400, { error: 'Invalid data id' })
      });

      it(`responds 200 and saved item only, for category ${category}`, () => {
        return supertest(app)
          .get(`${endpointPath}/${category}/${savedItem.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then(res => {
            savedFields.forEach(field => 
              expect(res.body[field]).to.be.eql(savedItem[field])
            );
          });
      });
    });
  });

	/*****************************************************************
    PATCH /api/saved/:category/:id

    Update particular item 
  ******************************************************************/
	describe(`PATCH ${endpointPath}/:category/:id`, () => {
    categories.forEach(category => {
      const savedItem = createSavedSeeds(category)[0];  
      beforeEach('seed category', () => helpers.seedCategory(db, category, [savedItem]));

      it(`responds 400 and message when invalid id`, () => {
        return supertest(app)
          .patch(`${endpointPath}/${category}/iAmInvalid`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(savedItem)
          .expect(400, { error: 'Invalid data id' })
      });
      
      it(`responds 200 and updated saved item only, for category ${category}`, () => {
        savedItem.favorited = !(savedItem.favorited);

        return supertest(app)
          .patch(`${endpointPath}/${category}/${savedItem.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(savedItem)
          .expect(200)
          .then(res => {
            savedFields.forEach(field => 
              res.body[field] && expect(res.body[field]).to.be.eql(savedItem[field])
            )
          });
      });
    });
  });

	/*****************************************************************
    DELETE /api/:category/:id

    Delete particular item 
  ******************************************************************/
	describe(`DELETE ${endpointPath}/:category/:id`, () => {
    categories.forEach(category => {
      const savedItem = createSavedSeeds(category)[0];
      beforeEach('seed category', () => helpers.seedCategory(db, category, [savedItem]));

      it(`responds 204 when savedFields are empty for category ${category}`, () => {
        savedItem.favorited = false; savedItem.notes = "";
        return supertest(app)
          .delete(`${endpointPath}/${category}/${savedItem.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(savedItem)
          .expect(204)
      });
    })
  });

});
