function analyze_full_chat(inputDir)
% Shared dictionary; database and essence remain separate, never added.
if nargin == 0
    inputDir = 'D:/Documents/SkyBlockTraining/analysis/full-chat';
end
here = fileparts(mfilename('fullpath'));
lex = jsondecode(fileread(fullfile(here,'full-chat-lexicon.json')));
coverage = jsondecode(fileread(fullfile(inputDir,'coverage.json')));
essence = jsondecode(fileread(fullfile(inputDir,'essence-coverage.json')));
A = loadMessages(fullfile(inputDir,'messages.csv'));
B = loadMessages(fullfile(inputDir,'essence.csv'));
A.source = ones(height(A),1); B.source = 2*ones(height(B),1);
T = [A; B]; clear A B;
months = unique(T.month);
ng = numel(coverage.groups); nm = numel(months);
nt = numel(lex.terms); nk = numel(lex.topics);
[~,mi] = ismember(T.month,months);
ci = sub2ind([ng nm 2],T.groupIndex,mi,T.source);
nc = ng*nm*2;
messages = accumarray(ci,1,[nc 1]);
counts = zeros(nc,nt); docs = counts;
topicHits = false(height(T),nk);
text = cellstr(lower(T.text));
for k = 1:nt
    hits = regexp(text,lex.terms(k).pattern,'start');
    n = cellfun(@numel,hits);
    if ~isempty(lex.terms(k).context)
        contextual = ~cellfun(@isempty,regexp(text,lex.terms(k).context,'once'));
        n(~contextual) = 0;
    end
    counts(:,k) = accumarray(ci,n,[nc 1]);
    docs(:,k) = accumarray(ci,double(n>0),[nc 1]);
    for j = 1:nk
        if ismember(k,lex.topics(j).termIndices)
            topicHits(:,j) = topicHits(:,j) | n>0;
        end
    end
    if mod(k,10)==0 || k==nt
        fprintf('Term %d/%d\n',k,nt);
    end
end
topics = zeros(nc,nk);
for j = 1:nk
    topics(:,j) = accumarray(ci,double(topicHits(:,j)),[nc 1]);
end
unmatched = accumarray(ci,double(~any(topicHits,2)),[nc 1]);
cells = repmat(struct('group',0,'month',0,'messages',0,'counts',[], ...
    'docs',[],'topics',[],'unmatched',0),nnz(messages),1);
source = zeros(nnz(messages),1); at = 0;
for i = find(messages)'
    at = at+1;
    [g,m,s] = ind2sub([ng nm 2],i);
    cells(at) = struct('group',g,'month',m,'messages',messages(i), ...
        'counts',counts(i,:),'docs',docs(i,:), ...
        'topics',topics(i,:),'unmatched',unmatched(i));
    source(at) = s;
end
out = struct('schemaVersion',2,'engine',['MATLAB ' version], ...
    'dictionaryVersion',lex.version,'categories',lex.categories, ...
    'coverage',coverage,'essenceCoverage',essence,'months',months, ...
    'terms',lex.terms,'topics',lex.topics,'dictionarySources',lex.sources, ...
    'dictionaryNotes',{lex.notes},'cells',cells(source==1),'essenceCells',cells(source==2));
publicPath = fullfile(here,'..','full-chat-data.json');
tempPath = [publicPath '.tmp'];
fid = fopen(tempPath,'w','n','UTF-8');
assert(fid~=-1,'Cannot write aggregate JSON');
fprintf(fid,'%s',jsonencode(out)); fclose(fid);
movefile(tempPath,publicPath,'f');
fprintf('Exported %d database + %d essence messages\n',sum(T.source==1),sum(T.source==2));
end

function T = loadMessages(path)
opts = detectImportOptions(path,'TextType','string','Encoding','UTF-8');
opts = setvartype(opts,{'month','sender','text'},'string');
T = readtable(path,opts);
T.text(ismissing(T.text)) = "";
T.sender(ismissing(T.sender)) = "";
end
