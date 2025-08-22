'use server';

export async function postJob(previousState: any, formData: FormData) {
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        requirements: formData.get('requirements'),
        perks: formData.get('perks'),
        companyProfile: formData.get('companyProfile'),
    };

    console.log(data);

    return {
        ...previousState,
        success: 'Job posted successfully!',
    };
}
