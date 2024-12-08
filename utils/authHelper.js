const { db } = require('../handlers/db.js');
const CatLoggr = require('cat-loggr');
const log = new CatLoggr();


/**
 * Checks if the user is authorized to access the specified container ID.
 * @param {string} userId - The unique identifier of the user.
 * @param {string} containerId - The container ID to check authorization for.
 * @returns {Promise<boolean>} True if the user is authorized, otherwise false.
 */
async function isUserAuthorizedForContainer(userId, containerId) {
    try {
        const userInstances = await db.get(userId + '_instances') || [];
        const users = await db.get('users') || [];

        const user = users.find(user => user.userId === userId);
        if (!user) {
            console.error('User not found:', userId);
            return false;
        }

        if (user.admin) {
            return true;
        }
        const subUserInstances = user.accessTo || [];
        const isInSubUserInstances = subUserInstances.includes(containerId);

        const isInUserInstances = userInstances.some(instance => instance.Id === containerId);
        if (isInSubUserInstances || isInUserInstances) {
            return true;
        } else {
            console.error('User not authorized for container:', containerId);
            return false;
        }
    } catch (error) {
        console.error('Error fetching user instances:', error);
        return false;
    }
}

async function isInstanceSuspended(instanceId) {
    // Retrieve the instance data
    let instance = await db.get(`${instanceId}_instance`);

    // If the instance doesn't exist, initialize it
    if (!instance) {
        instance = { suspended: false }; // Default instance object
        await db.set(`${instanceId}_instance`, instance);
    }

    // Check if the instance is suspended
    if (instance.suspended === true) {
        return res.redirect(`../../instance/${instanceId}/suspended`);
    }

    // Ensure the suspended property is set (if missing)
    if (typeof instance.suspended === 'undefined') {
        instance.suspended = false;
        await db.set(`${instanceId}_instance`, instance);
    }

    // If not suspended, continue as normal
    return false;
}

module.exports = {
    isUserAuthorizedForContainer,
    isInstanceSuspended
};