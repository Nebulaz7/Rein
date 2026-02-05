"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { githubAPI } from "@/lib/github";

interface TaskData {
  id: string;
  title: string;
  description: string;
  scheduledDate?: string;
  stageTitle?: string;
  resources?: Array<{ type: string; title: string; url: string }>;
}

interface TaskGitHubPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskData;
  userId: string;
  resolutionId: string;
  onSuccess?: (issueUrl: string, repoUrl: string) => void;
  onDecline?: () => void;
}

type Step = "prompt" | "repo-selection" | "success" | "error";
type RepoOption = "existing" | "new";

export default function TaskGitHubPromptModal({
  open,
  onOpenChange,
  task,
  userId,
  resolutionId,
  onSuccess,
  onDecline,
}: TaskGitHubPromptModalProps) {
  const [step, setStep] = useState<Step>("prompt");
  const [repoOption, setRepoOption] = useState<RepoOption>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [existingRepoUrl, setExistingRepoUrl] = useState("");
  const [newRepoName, setNewRepoName] = useState(
    task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50)
  );
  const [repoDescription, setRepoDescription] = useState(
    `Learning project: ${task.title}`
  );
  const [isPrivate, setIsPrivate] = useState(true);

  // Success states
  const [createdIssueUrl, setCreatedIssueUrl] = useState("");
  const [createdRepoUrl, setCreatedRepoUrl] = useState("");
  const [issueNumber, setIssueNumber] = useState<number>(0);

  const handleDecline = async () => {
    onDecline?.();
    onOpenChange(false);
  };

  const handleProceed = () => {
    setStep("repo-selection");
  };

  const handleCreateIssue = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let repoUrl = existingRepoUrl;

      // Create new repo if needed
      if (repoOption === "new") {
        const repoResult = await githubAPI.createRepository({
          userId,
          name: newRepoName,
          description: repoDescription,
          private: isPrivate,
          autoInit: true,
        });

        if (!repoResult.success) {
          throw new Error(repoResult.error || "Failed to create repository");
        }

        repoUrl = repoResult.repository.repoUrl;
        setCreatedRepoUrl(repoUrl);
      }

      // Create GitHub issue
      const issueResult = await githubAPI.createIssueForTask({
        userId,
        repoUrl,
        task: {
          title: task.title,
          description: task.description,
          scheduledDate: task.scheduledDate,
          stageTitle: task.stageTitle,
          resources: task.resources,
        },
        labels: ["rein-ai", "learning-task"],
      });

      if (!issueResult.success) {
        throw new Error(issueResult.error || "Failed to create issue");
      }

      // Update task with GitHub metadata
      await githubAPI.updateTaskGitHub({
        userId,
        resolutionId,
        taskId: task.id,
        githubIssueUrl: issueResult.issue.url,
        githubRepoUrl: repoUrl,
        githubIssueNumber: issueResult.issue.number,
      });

      setCreatedIssueUrl(issueResult.issue.url);
      setIssueNumber(issueResult.issue.number);
      setStep("success");

      if (onSuccess) {
        onSuccess(issueResult.issue.url, repoUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create GitHub issue");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPromptStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/10 dark:bg-white/10 rounded-lg">
            <Github className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <DialogTitle>Create GitHub Issue?</DialogTitle>
            <DialogDescription>
              Track this practical coding task on GitHub
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="bg-primary/10 border-primary">
              Practical Task
            </Badge>
          </div>
          <h4 className="font-semibold mt-3 text-foreground">{task.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
          {task.stageTitle && (
            <p className="text-xs text-muted-foreground mt-2">
              Stage: {task.stageTitle}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Creating a GitHub issue helps you track your progress, collaborate,
            and build a portfolio of your learning journey.
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={handleDecline} disabled={isLoading}>
          No, Skip
        </Button>
        <Button onClick={handleProceed} disabled={isLoading}>
          <Github className="w-4 h-4" />
          Yes, Create Issue
        </Button>
      </DialogFooter>
    </>
  );

  const renderRepoSelectionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Select Repository</DialogTitle>
        <DialogDescription>
          Choose where to create the GitHub issue
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {/* Existing Repo Option */}
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            repoOption === "existing"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => setRepoOption("existing")}
        >
          <div className="flex items-center h-5">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                repoOption === "existing"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            >
              {repoOption === "existing" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <Label className="font-semibold cursor-pointer">
              Use existing repository
            </Label>
            <Input
              placeholder="owner/repo-name"
              value={existingRepoUrl}
              onChange={(e) => setExistingRepoUrl(e.target.value)}
              className="mt-2"
              disabled={repoOption !== "existing"}
            />
          </div>
        </div>

        {/* New Repo Option */}
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            repoOption === "new"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => setRepoOption("new")}
        >
          <div className="flex items-center h-5">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                repoOption === "new"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            >
              {repoOption === "new" && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <Label className="font-semibold cursor-pointer">
              Create new repository
            </Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label htmlFor="repo-name" className="text-xs">
                  Repository Name
                </Label>
                <Input
                  id="repo-name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  disabled={repoOption !== "new"}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="repo-desc" className="text-xs">
                  Description
                </Label>
                <Input
                  id="repo-desc"
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  disabled={repoOption !== "new"}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private-repo"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={repoOption !== "new"}
                  className="rounded border-border"
                />
                <Label htmlFor="private-repo" className="text-xs cursor-pointer">
                  Private repository
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("prompt")}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          onClick={handleCreateIssue}
          disabled={
            isLoading ||
            (repoOption === "existing" && !existingRepoUrl.trim()) ||
            (repoOption === "new" && !newRepoName.trim())
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Github className="w-4 h-4" />
              Create Issue
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <DialogTitle>GitHub Issue Created!</DialogTitle>
            <DialogDescription>
              Issue #{issueNumber} created successfully
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Repository</p>
          <a
            href={`https://github.com/${createdRepoUrl || existingRepoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            {createdRepoUrl || existingRepoUrl}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-2">Issue</p>
          <a
            href={createdIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View Issue #{issueNumber} on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Done
        </Button>
      </DialogFooter>
    </>
  );

  const renderErrorStep = () => (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <DialogTitle>Failed to Create Issue</DialogTitle>
            <DialogDescription>Something went wrong</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={() => setStep("repo-selection")}>Try Again</Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "prompt" && renderPromptStep()}
        {step === "repo-selection" && renderRepoSelectionStep()}
        {step === "success" && renderSuccessStep()}
        {step === "error" && renderErrorStep()}
      </DialogContent>
    </Dialog>
  );
}
