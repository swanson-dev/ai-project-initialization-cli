export function fillTemplate(template, replacements) {
    return Object.entries(replacements).reduce((acc, [key, value]) => {
        const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        return acc.replace(pattern, value);
    }, template);
}
