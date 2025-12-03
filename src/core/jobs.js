import schedule from 'node-schedule';
import { Explorateur } from '../models/explorateur.model.js';
import { TABLE_ELEMENT } from './constants.js';

const jobAddInox = schedule.scheduleJob('*/1 * * * *', async function(){
    //Ajouter 2 inox à tous les explorateurs chaque 5 minutes
    await Explorateur.updateMany({}, { $inc: { 'inventory.vault.inox': 2 } })
        console.log('2 inox added to all explorateurs');
});

// pour chaque heures 0 */1 * * *
// Ajout entre 1 et 3 de quantités de chaques éléments à chaque explorateurs toutes les heures
const jobAddElements = schedule.scheduleJob('0 */1 * * *', async function() {
    // Récupérer tous les explorateurs
    const explorateurs = await Explorateur.find({});
    console.log(`Found ${explorateurs}`);
    // Pour chaque explorateur, incrémenter chaque élément d'une quantité aléatoire entre 1 et 3
    for (const explorateur of explorateurs) {
        const updateObj = {};
        TABLE_ELEMENT.forEach((element, index) => {
            const randomQuantity = Math.floor(Math.random() * 3) + 1;
            updateObj[`inventory.vault.elements.${index}.quantity`] = randomQuantity;
            console.log(`Adding ${randomQuantity} of ${element.symbol} to explorateur ${explorateur.uuid}`);
        });
        
        await Explorateur.updateOne(
            { _id: explorateur._id },
            { $inc: updateObj }
        );
    }
    
    console.log('Random elements added to all explorateurs');
});

// à chaque jours à minuit 0 0 * * *
// Job pour ajouter un lootbox à chaque explorateur à tout les jours à minuit
const jobAddLootbox = schedule.scheduleJob('0 0 * * *', async function() {
    await Explorateur.updateMany({}, { $inc: { nbLootboxes: 1 } });
    console.log('1 lootbox added to all explorateurs');
});

export default { jobAddInox, jobAddElements, jobAddLootbox };

