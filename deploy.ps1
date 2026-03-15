# VibeKid Azure Container Apps Deployment Script
# Run from the project root: .\deploy.ps1

$ErrorActionPreference = "Stop"

# --- Configuration (all read from .env.local) ---
$envFile = Get-Content .env.local | Where-Object { $_ -match "^\w" }
$envVars = @{}
foreach ($line in $envFile) {
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
}

# Azure account
$TENANT_ID = $envVars["AZURE_TENANT_ID"]
$SUBSCRIPTION_ID = $envVars["AZURE_SUBSCRIPTION_ID"]
$RESOURCE_GROUP = $envVars["AZURE_RESOURCE_GROUP"]
$LOCATION = $envVars["AZURE_LOCATION"]
$APP_NAME = $envVars["AZURE_APP_NAME"]
$ENV_NAME = $envVars["AZURE_ENV_NAME"]

# Azure OpenAI
$OPENAI_KEY = $envVars["AZURE_OPENAI_API_KEY"]
$OPENAI_ENDPOINT = $envVars["AZURE_OPENAI_ENDPOINT"]
$OPENAI_DEPLOYMENT = $envVars["AZURE_OPENAI_DEPLOYMENT"]
$OPENAI_TTS = $envVars["AZURE_OPENAI_TTS_DEPLOYMENT"]
$OPENAI_STT = $envVars["AZURE_OPENAI_STT_DEPLOYMENT"]

if (-not $TENANT_ID -or -not $SUBSCRIPTION_ID -or -not $OPENAI_KEY) {
    Write-Host "ERROR: .env.local is missing required variables. See .env.local.example" -ForegroundColor Red
    exit 1
}

Write-Host "=== VibeKid Deployment ===" -ForegroundColor Cyan

# --- Step 1: Login check ---
Write-Host "`n[1/5] Checking Azure login..." -ForegroundColor Yellow
$account = az account show --query "tenantId" -o tsv 2>$null
if ($account -ne $TENANT_ID) {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login --tenant $TENANT_ID --output none
}
az account set --subscription $SUBSCRIPTION_ID --output none
Write-Host "Subscription set: $SUBSCRIPTION_ID" -ForegroundColor Green

# --- Step 2: Ensure resource providers are registered ---
Write-Host "`n[2/6] Registering resource providers..." -ForegroundColor Yellow
az provider register -n Microsoft.App --wait --output none 2>$null
az provider register -n Microsoft.OperationalInsights --wait --output none 2>$null
Write-Host "Resource providers registered" -ForegroundColor Green

# --- Step 3: Ensure resource group exists ---
Write-Host "`n[3/6] Checking resource group..." -ForegroundColor Yellow
$rgExists = az group exists --name $RESOURCE_GROUP
if ($rgExists -eq "false") {
    Write-Host "Creating resource group $RESOURCE_GROUP in $LOCATION..." -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION --output none
}
Write-Host "Resource group: $RESOURCE_GROUP" -ForegroundColor Green

# --- Step 3: Ensure Container Apps environment exists ---
Write-Host "`n[4/6] Checking Container Apps environment..." -ForegroundColor Yellow
$envExists = az containerapp env show --name $ENV_NAME --resource-group $RESOURCE_GROUP --query "name" -o tsv 2>$null
if (-not $envExists) {
    Write-Host "Creating Container Apps environment (this takes 1-2 min)..." -ForegroundColor Yellow
    az containerapp env create `
        --name $ENV_NAME `
        --resource-group $RESOURCE_GROUP `
        --location $LOCATION `
        --output none
}
Write-Host "Environment: $ENV_NAME" -ForegroundColor Green

# --- Step 4: Deploy (build from source + deploy) ---
Write-Host "`n[5/6] Building and deploying (this takes 3-5 min)..." -ForegroundColor Yellow
az containerapp up `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --environment $ENV_NAME `
    --source . `
    --env-vars `
        "AZURE_OPENAI_API_KEY=$OPENAI_KEY" `
        "AZURE_OPENAI_ENDPOINT=$OPENAI_ENDPOINT" `
        "AZURE_OPENAI_DEPLOYMENT=$OPENAI_DEPLOYMENT" `
        "AZURE_OPENAI_TTS_DEPLOYMENT=$OPENAI_TTS" `
        "AZURE_OPENAI_STT_DEPLOYMENT=$OPENAI_STT" `
    --ingress external `
    --target-port 3000

# --- Step 5: Configure scale to zero ---
Write-Host "`n[6/6] Configuring scale-to-zero..." -ForegroundColor Yellow
az containerapp update `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --min-replicas 0 `
    --max-replicas 1 `
    --output none

# --- Done ---
$FQDN = az containerapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "`n=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "URL: https://$FQDN" -ForegroundColor Green
Write-Host "Login: test / 14421" -ForegroundColor Green
Write-Host "Debug: https://$FQDN/workspace?debug=1" -ForegroundColor DarkGray
