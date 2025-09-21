export const formatDate = (dateString) => {
    return new Date(dateString + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' });
};