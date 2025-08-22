"use server";

import { createJobPost } from '@/lib/db/queries';
import { getUser } from '@/lib/db/queries';

export async function postJob(previousState: any, formData: FormData) {
    const user = await getUser();

    if (!user) {
        return {
            ...previousState,
            error: 'You must be logged in to post a job.',
        };
    }

    const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        requirements: formData.get('requirements') as string,
        perks: formData.get('perks') as string,
    };

    try {
        await createJobPost(
            user.id,
            data.title,
            data.description,
            data.requirements,
            data.perks
        );

        return {
            ...previousState,
            success: 'Job posted successfully!',
        };
    } catch (error) {
        return {
            ...previousState,
            error: 'Failed to post job.',
        };
    }
}
