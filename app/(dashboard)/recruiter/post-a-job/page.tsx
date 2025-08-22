
'use client';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { postJob } from './actions';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActionState = {
    title?: string;
    description?: string;
    location?: string;
    requirements?: string;
    perks?: string;
    benefits?: string;
    companyProfile?: string;
    error?: string;
    success?: string;
};

export default function PostAJobPage() {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        postJob,
        {}
    );
    const [location, setLocation] = useState('on-site');

    return (
        <section className="flex-1 p-4 lg:p-8">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
                Post a Job
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" action={formAction}>
                        <div>
                            <Label htmlFor="title" className="mb-2">
                                Job Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter the job title"
                                defaultValue={state.title}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="mb-2">
                                Job Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter the job description"
                                defaultValue={state.description}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="requirements" className="mb-2">
                                Job Requirements
                            </Label>
                            <Textarea
                                id="requirements"
                                name="requirements"
                                placeholder="Enter the job requirements"
                                defaultValue={state.requirements}
                            />
                        </div>
                        <div>
                            <Label htmlFor="location" className="mb-2">
                                Location
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{location}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuRadioGroup value={location} onValueChange={setLocation}>
                                        <DropdownMenuRadioItem value="on-site">On-site</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="hybrid">Hybrid</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="remote">Remote</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input type="hidden" name="location" value={location} />
                        </div>
                        
                        <div>
                            <Label htmlFor="perks" className="mb-2">
                                Perks & Benefits
                            </Label>
                            <Textarea
                                id="perks"
                                name="perks"
                                placeholder="Enter the perks and benefits"
                                defaultValue={state.perks}
                            />
                        </div>
                        <div>
                            <Label htmlFor="companyProfile" className="mb-2">
                                Company Profile
                            </Label>
                            <Textarea
                                id="companyProfile"
                                name="companyProfile"
                                placeholder="Enter the company profile"
                                defaultValue={state.companyProfile}
                            />
                        </div>
                        {state.error && (
                            <p className="text-red-500 text-sm">{state.error}</p>
                        )}
                        {state.success && (
                            <p className="text-green-500 text-sm">{state.success}</p>
                        )}
                        <Button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post Job'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
